import * as kafka from 'node-rdkafka';
import * as murmur from 'murmurhash-js';

import {OutputMessage} from '../../domain/models/messages/out'
import {MessageProducerService} from '../../domain/services/messageProducer'


export class KafkaMessageProducer implements MessageProducerService{
    private readonly producer: kafka.Producer;
    private readonly topic:    string;

    constructor(producer: kafka.Producer, topic: string) {
        this.producer = producer;
        this.topic    = topic;
    }

    private async getMetadata(
        producer:   kafka.Producer,
        topic:      string,
        timeout:    number
    ): Promise<kafka.Metadata> {
        return await new Promise((resolve, reject) => {
            producer.getMetadata({topic: topic, timeout:timeout}, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata);
                }
            });
        })
    }

    private getNumberOfPartitions(metadata: kafka.Metadata, topic: string): number | null {
        const topicMetadata: kafka.TopicMetadata = metadata.topics.find((item) => item.name === topic)
        if (topicMetadata){
            return topicMetadata.partitions.length
        } else {
            return null
        }
    }

    private getPartition(str: string, numPartitions: number): number {
        return Math.abs(murmur.murmur2(str)) % numPartitions
    }

    async produce(message: OutputMessage): Promise<OutputMessage>{
        const metadata = await this.getMetadata(this.producer, this.topic, 50)
        const numPartitions = this.getNumberOfPartitions(metadata, this.topic)
        const partition = this.getPartition(message.hostId, numPartitions)

        await new Promise((resolve, reject) => {
            try {
                this.producer.produce(
                    this.topic,                                    // topic
                    partition,                                     // -1 to use default partitioner
                    Buffer.from(JSON.stringify(message)),          // msg
                    message.id,                                    // key
                )
                resolve()
            } catch (err) {
                reject(err)
            }
        })
            .catch(error => { throw error })

        await new Promise((resolve, reject) => {
            return this.producer.flush(5000, (err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        })
            .catch(error => { throw error })

        return message
    }

}
