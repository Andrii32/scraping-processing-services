
import * as winston from 'winston';
import * as logform from 'logform';

const formatError = winston.format((info: logform.TransformableInfo, opts) => {
    if (info.error instanceof Error){
        const error = info.error
        return {...info, error: { name: error.name, message: error.message, stack: error.stack, ...error}};
    } else {
        return info;
    }
  });


export const makeLogger = () => winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        formatError(),
        winston.format.metadata(),
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
    ]
});
