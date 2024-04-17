export class Message {
    readonly query : string = undefined;
    readonly content : string = undefined;
    timestamp : number = undefined;

    constructor(query : string, content : string) {
        this.query = query;
        this.content = content;
    }

    static BufferToMessage(buffer : Buffer) : Message {
        return JSON.parse(buffer.toString()) as Message;
    }

    static toJSON(msg : Message) {
        return JSON.stringify(msg);
    }
}