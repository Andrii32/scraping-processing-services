
import {FileId} from '../entities/fileId';
import {Downloaded} from '../entities/downloaded';

export interface FileRepository {

    save(downloaded: Downloaded): Promise<FileId>;

}
