import {InputMessage} from '../entities/messages/inp';


export interface Consumed<T> {
    message: InputMessage
    origin:  T
};


export interface MessageConsumerService<T> {

    consume(): Promise<Consumed<T> | null>;

    done(origin: T): T

}
