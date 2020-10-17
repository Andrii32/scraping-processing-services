import * as pg from 'pg';

import {MessageProcessingFailure} from '../../domain/entities/messageProcessingFailure'
import {FailureRepository} from '../../domain/repositories/failureRepository';


export class DbFailureRepository implements FailureRepository{
    private readonly client: pg.Client;

    constructor(client: pg.Client) {
        this.client = client;
    }

    async registerFailure(failure: MessageProcessingFailure): Promise<MessageProcessingFailure> {
        return this.client.query(
            `
            INSERT INTO failures(
                id,
                service_id,
                failure_name,
                failure_description,
                message_failed_key,
                message_failed_value,
                message_topic,
                message_partition,
                message_offset,
                created_at)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            `,
            [
                failure.id,
                failure.service.id,
                failure.failureName,
                failure.failureDescription,
                failure.messageFailedKey,
                failure.messageFailedValue,
                failure.messageTopic,
                failure.messagePartition,
                failure.messageOffset
            ]
        )
        .then(() => { return failure })
    }

}
