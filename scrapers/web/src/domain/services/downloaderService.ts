import {Downloaded} from '../models/downloaded';


export interface DownloaderService {

    download(url: string, id: string): Promise<Downloaded>;

}
