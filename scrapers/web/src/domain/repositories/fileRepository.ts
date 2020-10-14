
import {FileId} from '../models/fileId';

export interface FileRepository {

    save(id: string, body: Buffer): Promise<FileId>;

}

