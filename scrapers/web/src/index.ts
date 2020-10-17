import * as process from 'process';
import * as kafka from 'node-rdkafka';
import * as delay from 'delay';
import { v4 as uuid } from 'uuid';

import { getConfig } from './config/config';
import { Config } from './config/models';

import { Logger } from './domain/services/logger'
import { Service } from './domain/models/service'
import { MessageProcessingFailure } from './domain/models/messageProcessingFailure'
import { FailureRepository} from './domain/repositories/failureRepository';
import { MessageConsumerService, Consumed } from './domain/services/messageConsumer';
import { FileRepository } from './domain/repositories/fileRepository';
import { MessageProducerService } from './domain/services/messageProducer';

import { makeScrape, Scrape } from './application/scrape';

import { makeLogger } from './infrastructure/logging/logging';
import { MinioFileRepository } from './infrastructure/minio/minioFileRepository';
import { KafkaMessageConsumer } from './infrastructure/kafka/consumer';
import { KafkaMessageProducer } from './infrastructure/kafka/producer';
import { CommitManager } from './infrastructure/kafka/commitManager';
import { PuppeteerDownloaderService } from './infrastructure/puppeteer/puppeteerDownloader';
import { minioClientFromConfig, initMinio } from './infrastructure/minio/utils';
import { initPostgres, postgresClientFromConfig } from './infrastructure/postgres/utils';
import { puppeteerBrowserFromConfig } from './infrastructure/puppeteer/utils';
import { kafkaConsumerClientFromConfig, kafkaProducerClientFromConfig } from './infrastructure/kafka/utils';
import { DbFailureRepository } from './infrastructure/postgres/dbFailureRepository';


const worker = async(
    service:            Service,
    worker_id:          number,
    messageConsumer:    MessageConsumerService<kafka.Message>,
    messageProducer:    MessageProducerService,
    fileRepository:     FileRepository,
    failureRepository:  FailureRepository,
    logger:             Logger,
    config:             Config
): Promise<void> => {
    let worker_log = logger.child({ worker_id: worker_id });
    const browser = await puppeteerBrowserFromConfig(config.puppeteerConfig)
    const downloader = new PuppeteerDownloaderService(
        browser,
        config.scraperConfig.downloadTimeout,
        config.scraperConfig.screenshotSettings
    )
    const scrape: Scrape = makeScrape(downloader, fileRepository, messageProducer)

    while(true){
        let log = worker_log.child({});
        const consumed: Consumed<kafka.Message> | null = await messageConsumer.consume()
        log.info('consuming');
        if (!consumed) {
            await delay(config.scraperConfig.consumerPoolDelay);
            continue
        }
        log = log.child({ input_message: consumed.message });
        await scrape(consumed.message, log)
            .then(() => {
                messageConsumer.done(consumed.origin)
                log.info('done', {state: 'SUCCESS'})
            })
            .catch(error => {
                const failure: MessageProcessingFailure = {
                    id:                  uuid(),
                    service:             service,
                    failureName:         `${error.name}: ${error.message}`,
                    failureDescription:  error.stack,
                    messageFailedKey:    consumed.origin?.key.toString(),
                    messageFailedValue:  consumed.origin?.value.toString(),
                    messageTopic:        consumed.origin.topic,
                    messagePartition:    consumed.origin.partition.toString(),
                    messageOffset:       consumed.origin.offset.toString()
                }
                log.info('failure', { failure: failure })
                failureRepository.registerFailure(failure)
                    .then(() => {
                        log.info('failure registered')
                        messageConsumer.done(consumed.origin)
                        log.info('done', {state: 'FAILURE'})
                    })
            })
    }
}

const run = async() => {
    const config: Config = getConfig()
    const logger: Logger = makeLogger()

    await Promise.all([
        kafkaProducerClientFromConfig(config.kafkaProducerConfig),
        kafkaConsumerClientFromConfig(config.kafkaConsumerConfig),
        minioClientFromConfig(config.minIOConfig)
            .then(minio => initMinio(minio, config.minIOConfig)),
        postgresClientFromConfig(config.postgresConfig)
            .then(postgres => initPostgres(postgres, {id: uuid(), name: config.serviceName})),
    ])
    .then(([
        [producer, pMetadata], [consumer, cMetadata], minio, [postgres, service]
    ]) => {
        consumer.subscribe([config.kafkaConsumerConfig.topic])
        const commitManager = new CommitManager(consumer, logger)
        setInterval(() => {
            commitManager.commit()
                .catch(error => {
                    logger.error(error)
                    process.exit(1)
                })
        }, config.scraperConfig.commitDelay)

        const fileRepository = new MinioFileRepository(
            minio,
            config.minIOConfig.bucketDownloaded
        )
        const failureRepository = new DbFailureRepository(
            postgres
        )
        const messageConsumer = new KafkaMessageConsumer(
            consumer,
            commitManager
        )
        const messageProducer = new KafkaMessageProducer(
            producer,
            config.kafkaProducerConfig.topic
        )

        return Promise.all(
            [...Array(config.scraperConfig.concurrency).keys()]
                .map(worker_id => worker(
                    service,
                    worker_id,
                    messageConsumer,
                    messageProducer,
                    fileRepository,
                    failureRepository,
                    logger,
                    config
                )
            )
        )
    }).catch(error => {
        logger.error(error)
        process.exit(1)
    })
}

run()
