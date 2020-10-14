import * as AWS from 'aws-sdk';

import {FileId} from '../../domain/models/fileId';
import {FileRepository} from '../../domain/repositories/fileRepository';

export class MinioFileRepository implements FileRepository{
    private readonly client: AWS.S3;
    private readonly bucket: string;

    constructor(client: AWS.S3, bucket: string) {
        this.client = client;
        this.bucket = bucket;
    }

    async save(id: string, body: Buffer): Promise<FileId>{
        const params = {Bucket: this.bucket, Key: id + ".json", Body: body}
        return new Promise((resolve, reject) => {
            return this.client.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
                if (err) {
                    reject(err)
                }
                resolve({id: data.Bucket + ':' + data.Key})
            })
        })
    }
}