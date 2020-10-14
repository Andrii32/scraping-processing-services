import * as _ from "lodash";
import * as kafka from 'node-rdkafka';

import {Logger} from '../../domain/services/logger';

export type Topic     = string
export type Partition = string


export interface TopicPartition {
    topic:      string
    partition:  number
    offset:     number
}

export interface Offset {
    value:  number
    ready:  boolean
}

export type OffsetsStorage = Record<Topic, Record<Partition, Array<Offset>>>

/**
 * Because of synchronous way of message processing
 * enable.auto.offset.store=false and auto.commit.enable=true
 * offset management can not be used.
 * There is no guarantee that offsets will be added into storage (offsetsStore) in order.
 * This class was made to overcome above problem and not loose messages
 * Info:
 *      https://github.com/edenhill/librdkafka/blob/master/INTRODUCTION.md#at-least-once-processing
 */
export class CommitManager {
    offsets:  OffsetsStorage
    consumer: kafka.KafkaConsumer
    logger:   Logger

    constructor(consumer: kafka.KafkaConsumer, logger: Logger) {
        this.consumer = consumer;
        this.offsets = {} as OffsetsStorage;
        this.logger = logger
    }

    async commit() {
        try {
            let offsetsToCommit: Array<TopicPartition> = [];
            for (let topic in this.offsets) {
                for (let partition in this.offsets[topic]) {
                    this.offsets[topic][partition] = this.offsets[topic][partition].sort(
                        (o1, o2) => o1.value - o2.value
                    )
                    let firstNotReadyIndex = this.offsets[topic][partition].findIndex((offset) => { return !offset.ready });
                    let toCommit: Array<Offset>;
                    let toRetain: Array<Offset>
                    if (firstNotReadyIndex === -1){
                        toCommit = this.offsets[topic][partition]
                        toRetain = []
                    } else {
                        toCommit = this.offsets[topic][partition].slice(0, firstNotReadyIndex)
                        toRetain = this.offsets[topic][partition].slice(firstNotReadyIndex)
                    }
                    offsetsToCommit = offsetsToCommit.concat(
                        toCommit.map((offset) => ({
                            topic:     topic,
                            partition: parseInt(partition),
                            offset:    offset.value + 1
                        }))
                    )
                    this.offsets[topic][partition] = toRetain
                }
            }
            if (offsetsToCommit.length != 0){
                this.consumer.commit(offsetsToCommit)

                    _.forEach(_.groupBy(offsetsToCommit, v => v.topic + v.partition), value => {
                        this.logger.info('comitted', {comitted: value});
                    })
            }
        } catch (e) {
            Promise.reject(e)
        }
        Promise.resolve();
    }

    registerConsumed = (topicPartition: TopicPartition): void  => {
        const topic:     Topic = topicPartition.topic                    as Topic
        const partition: Partition = topicPartition.partition.toString() as Partition
        const offset:    number = topicPartition.offset

        this.offsets[topic] = this.offsets[topic] || {};
        this.offsets[topic][partition] = this.offsets[topic][partition] || [];
        let found = this.offsets[topic][partition].find(
            (o) => { return o.value === offset }
        );
        if (found) { throw new Error("such offset was consumed already")}
        this.offsets[topic][partition].push({value: offset, ready: false})
    }

    registerPrepared = (topicPartition: TopicPartition): void => {
        const topic:     Topic = topicPartition.topic                    as Topic
        const partition: Partition = topicPartition.partition.toString() as Partition
        const offset:    number = topicPartition.offset

        let offsetRecord = this.offsets[topic][partition].find(
            (o) => { return o.value === offset }
          );
        if (!offsetRecord) {
            throw new Error("offset is prepared but was not consumed")
        } else {
            offsetRecord.ready = true;
        }
    }

}


