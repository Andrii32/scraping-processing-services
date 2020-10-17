import {Downloaded} from '../entities/downloaded';


export interface DownloaderService {

    download(url: string, id: string): Promise<Downloaded>;

}
