import * as kafka from 'node-rdkafka';

import {InputMessage} from '../../domain/models/messages/inp';
import {MessageConsumerService, Consumed} from '../../domain/services/messageConsumer';
import {CommitManager} from '../../infrastructure/kafka/commitManager';


export class KafkaMessageConsumer implements MessageConsumerService<kafka.Message>{
    private readonly client: kafka.KafkaConsumer;
    private readonly commitManager: CommitManager;

    constructor(client: kafka.KafkaConsumer, commitManager: CommitManager) {
        this.client = client;
        this.commitManager = commitManager;
    }

    async consume(): Promise<Consumed<kafka.Message> | null>{
        return this.consumeRaw().then(m => {
            if (!m) {
                return null
            }
            this.commitManager.registerConsumed({
                topic: m.topic, partition: m.partition, offset: m.offset
            })
            return {
                message: this.deserialize(m),
                origin:  m
            }
        })
    }

    done(origin: kafka.Message): kafka.Message{
        this.commitManager.registerPrepared({
            topic: origin.topic, partition: origin.partition, offset: origin.offset
        })
        return origin
    }

    private async consumeRaw(): Promise<kafka.Message | null> {
        const consumed: Array<kafka.Message> = await new Promise<Array<kafka.Message>>((resolve, reject) => {
            this.client.consume(1, (err, messages) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            })
        })
            .catch(error => { throw error })
        if (!Array.isArray(consumed) || !consumed.length){
            return null
        }
        const message: kafka.Message = consumed.pop()
        if (!message) {
            return null
        }
        return message
    }

    private deserialize(message: kafka.Message): InputMessage{
        return JSON.parse(message.value.toString()) as InputMessage
    }

}
