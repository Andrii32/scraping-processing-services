import * as pg from 'pg';

import {Service} from '../../domain/models/service'
import { PostgresConfig } from '../../config/models';


export const getOrCreateService = async(client: pg.Client, service: Service): Promise<Service> => {
    return client.query(`BEGIN`)
        .then(() => {
            return client.query(
                `INSERT INTO services(id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING;`,
                [service.id, service.name]
            )
        })
        .then(() => {
            return client.query(
                `SELECT id, name FROM services WHERE name = $1`, [service.name]
            )
        })
        .then(result => {
            return { id: result.rows[0]['id'], name: result.rows[0]['name'] }
        })
        .then(service => {
            return client.query(`COMMIT`)
                .then(() => { return service })
        })
        .catch(e => {
            return client.query('ROLLBACK')
                .then(() => { throw e })
        })
    }

export const postgresClientFromConfig = async(config: PostgresConfig): Promise<pg.Client> => {
    const client = new pg.Client({
        host:       config.host,
        port:       config.port,
        database:   config.name,
        user:       config.user,
        password:   config.pass,
    })
    await client.connect()
    return client
}

export const initPostgres = async(client: pg.Client, service: Service): Promise<[pg.Client, Service]> => {
    return await getOrCreateService(client, service)
        .then(actualService => { return [client, actualService] })
}
