import * as pg from 'pg';

import {FailureRepository, MessageProcessingFailure} from '../../domain/repositories/failureRepository';


export class DbFailureRepository implements FailureRepository{
    private readonly client: pg.Client;

    constructor(client: pg.Client) {
        this.client = client;
    }

    async registerFailure(failure: MessageProcessingFailure): Promise<MessageProcessingFailure> {
        return this.client.query(
            `
            INSERT INTO failures(
                service,
                failure_name,
                failure_description,
                message_failed_key,
                message_failed_value,
                message_topic,
                message_partition,
                message_offset,
                created_at)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `,
            [
                failure.service.name,
                failure.failure_name,
                failure.failure_description,
                failure.message_failed_key,
                failure.message_failed_value,
                failure.message_topic,
                failure.message_partition,
                failure.message_offset
            ]
        )
        .then(() => { return failure })
    }

}
