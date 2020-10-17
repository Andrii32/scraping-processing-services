import {OutputMessage} from '../entities/messages/out';


export interface MessageProducerService {

    produce(message: OutputMessage): Promise<OutputMessage>;

}
