import {MessageProcessingFailure} from '../entities/messageProcessingFailure'

export interface FailureRepository {

    registerFailure(failure: MessageProcessingFailure): Promise<MessageProcessingFailure>;

}
