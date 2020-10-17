import {Service} from './service'

export interface MessageProcessingFailure {
    id:                   string
    service:              Service
    failureName:          string
    failureDescription:   string
    messageFailedKey:     string
    messageFailedValue:   string
    messageTopic:         string
    messagePartition:     string
    messageOffset:        string
};