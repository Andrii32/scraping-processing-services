import * as pg from 'pg';

import {  PostgresConfig } from '../../config/models';


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
