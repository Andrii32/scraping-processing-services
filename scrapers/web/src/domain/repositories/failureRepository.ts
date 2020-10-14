import {Service} from '../models/service';

export interface MessageProcessingFailure {
    service:              Service
    failure_name:         string
    failure_description:  string
    message_failed_key:   string
    message_failed_value: string
    message_topic:        string
    message_partition:    string
    message_offset:       string
};

export interface FailureRepository {

    registerFailure(failure: MessageProcessingFailure): Promise<MessageProcessingFailure>;

}
