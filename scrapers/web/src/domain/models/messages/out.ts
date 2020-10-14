import {FileId} from '../fileId';

export interface Failure {
    name:         string
    description?: string
};

export interface Status {
    code:   number
    text:   string
};

export interface OutputMessage {
    id:                 string
    hostId:             string
    url:                string
    downloadedFile:     FileId
    screenshotFile?:    FileId
    status?:            Status
    failure?:           Failure
};

