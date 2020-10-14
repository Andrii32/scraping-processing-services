export interface LogMethod<T extends Logger> {
    (message: string, ...meta: any[]): T;
    (message: any): T;
    (infoObject: object): T;
}

export interface Logger {
    info:  LogMethod<Logger>
    error: LogMethod<Logger>
    child(options: Object): Logger
}
