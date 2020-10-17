import {MessageProcessingFailure} from '../models/messageProcessingFailure'

export interface FailureRepository {

    registerFailure(failure: MessageProcessingFailure): Promise<MessageProcessingFailure>;

}
