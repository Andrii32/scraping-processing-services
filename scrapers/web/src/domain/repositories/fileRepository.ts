
import {FileId} from '../models/fileId';
import {Downloaded} from '../models/downloaded';

export interface FileRepository {

    save(downloaded: Downloaded): Promise<FileId>;

}
