
import {Logger} from '../domain/services/logger';
import {DownloaderService} from '../domain/services/downloaderService';
import {FileRepository} from '../domain/repositories/fileRepository';
import {MessageProducerService} from '../domain/services/messageProducer';
import {InputMessage} from '../domain/models/messages/inp';
import {OutputMessage} from '../domain/models/messages/out';


export type Scrape = (inputMessage: InputMessage, logContext: object) => Promise<OutputMessage>


/**
 * @param downloader
 * @param fileRepository
 * @param messageProducer
 * @param logger
 *
 * Constructs method which downloads InputMessage url,
 * saves downloaded content using FileRepository,
 * produces message using MessageProducerService,
 * in case of error, throws it up
 */
export const makeScrape = (
    downloader:        DownloaderService,
    fileRepository:    FileRepository,
    messageProducer:   MessageProducerService,
): Scrape => {
    return async(message: InputMessage, logger: Logger): Promise<OutputMessage> => {
        let log = logger.child({ inputMessage: message }) // should log context be unpacked here?
        return downloader.download(message.url, message.id)
            .then(
                downloaded => {
                    log.info('downloaded', {
                        downloaded: {
                            status:         downloaded.status,
                            contentSize:    downloaded?.content ? Buffer.byteLength(downloaded?.content, 'utf8') : 0,
                            failure:        downloaded.failure
                        }
                    })
                    return fileRepository.save(downloaded)
                        .then(
                            fileId => {
                                log.info('stored', { stored: { downloadedFile: fileId, screenshotFile: null } })
                                const outputMessage: OutputMessage = {
                                    id:                 message.id,
                                    hostId:             message.hostId,
                                    url:                message.url,
                                    status:             downloaded.status,
                                    downloadedFile:     fileId,
                                    screenshotFile:     null,
                                    failure:            downloaded.failure
                                }
                                return messageProducer.produce(outputMessage)
                            }
                        )
                        .then(outputMessage => {
                            log.info('message produced', { output_message: outputMessage })
                            return outputMessage
                        })

                }
            )
            .catch(error => { throw error })
    }
}
