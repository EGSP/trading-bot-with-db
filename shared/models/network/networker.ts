import {Message} from "./message";
import {Reply, Request} from 'zeromq';
import {SimpleEventDispatcher} from "strongly-typed-events";

export class Networker {
    static onRequest : SimpleEventDispatcher<Message> = new SimpleEventDispatcher<Message>();
    static replySocket : Reply = new Reply;
    // @ts-ignore
    static async request(endpoint : string, message : Message) : Message {
        let socket = new Request;
        socket.connect(endpoint);

        await socket.send(JSON.stringify(message));
        let [response] = await socket.receive();

        return Message.BufferToMessage(response);
    }

    static async bindRequests(endpoint : string) {
        await Networker.replySocket.bind(endpoint);

        // @ts-ignore
        for await (const [msg] of Networker.replySocket) {
            Networker.onRequest.dispatch(Message.BufferToMessage(msg));
        }
    }

    static async respondRequest(message : Message) {
        await Networker.replySocket.send(Message.toJSON(message));
    }
}