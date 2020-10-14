import {OutputMessage} from '../models/messages/out';


export interface MessageProducerService {

    produce(message: OutputMessage): Promise<OutputMessage>;

}
