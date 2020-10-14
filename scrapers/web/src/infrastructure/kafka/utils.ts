import * as kafka from 'node-rdkafka';

import { KafkaConsumerConfig, KafkaProducerConfig } from '../../config/models';



export const kafkaConsumerClientFromConfig = async(
    config: KafkaConsumerConfig,
): Promise<[kafka.KafkaConsumer, kafka.Metadata]> => {
    const consumer = new kafka.KafkaConsumer({
        // configs https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
        'group.id':                     config.groupId,
        'metadata.broker.list':         config.bootstrapServers,
        'enable.auto.commit':           false,
        'enable.auto.offset.store':     false,
        'queued.max.messages.kbytes':   30720, // 30 mb per topic+partition
        'fetch.message.max.bytes':      30720  // 30 kb per topic+partition
    }, {
        // Action to take when there is no initial offset in offset store or the desired offset is out of range
        'auto.offset.reset': 'earliest',
    });
    return await new Promise((resolve, reject) => {
        consumer.connect({}, (err: kafka.LibrdKafkaError, metadata: kafka.Metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve([consumer, metadata]);
            }
        });
    })
}


export const kafkaProducerClientFromConfig = async(
    config: KafkaProducerConfig,
): Promise<[kafka.Producer, kafka.Metadata]> => {
    const producer = new kafka.Producer({
        'metadata.broker.list':         config.bootstrapServers,
    })
    return await new Promise((resolve, reject) => {
        producer.connect({}, (err: kafka.LibrdKafkaError, metadata: kafka.Metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve([producer, metadata]);
            }
        });
    })
}

