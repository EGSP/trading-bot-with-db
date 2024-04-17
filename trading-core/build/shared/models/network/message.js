Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(query, content) {
        this.query = undefined;
        this.content = undefined;
        this.timestamp = undefined;
        this.query = query;
        this.content = content;
    }
    static BufferToMessage(buffer) {
        return JSON.parse(buffer.toString());
    }
    static toJSON(msg) {
        return JSON.stringify(msg);
    }
}
exports.Message = Message;
//# sourceMappingURL=message.js.map