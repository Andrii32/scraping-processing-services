import * as AWS from 'aws-sdk';

import {  MinIOConfig } from '../../config/models';


export const createBucket = async(client: AWS.S3, bucket: string): Promise<AWS.S3.Types.CreateBucketOutput> => {
    return new Promise((resolve, reject) => {
        return client.createBucket({Bucket: bucket}, (err: Error, data: AWS.S3.Types.CreateBucketOutput) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}


export const minioClientFromConfig = async(config: MinIOConfig): Promise<AWS.S3> => {
    return new AWS.S3({
        'accessKeyId':      config.accessKey,
        'secretAccessKey':  config.secretKey,
        'endpoint':         config.url,
        's3ForcePathStyle': true,
        'signatureVersion': 'v4'
    });
}


export const initMinio = async(client: AWS.S3, config: MinIOConfig): Promise<AWS.S3> => {
    return await createBucket(client, config.bucketDownloaded)
        .catch(error => { if (error.code !== 'BucketAlreadyOwnedByYou') { throw error }})
        .then(_ => { return client })
}
