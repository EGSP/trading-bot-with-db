var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Networker = void 0;
const message_1 = require("./message");
const zeromq_1 = require("zeromq");
const strongly_typed_events_1 = require("strongly-typed-events");
class Networker {
    static async request(endpoint, message) {
        let socket = new zeromq_1.Request;
        socket.connect(endpoint);
        await socket.send(JSON.stringify(message));
        let [response] = await socket.receive();
        return message_1.Message.BufferToMessage(response);
    }
    static async bindRequests(endpoint) {
        var _a, e_1, _b, _c;
        await Networker.replySocket.bind(endpoint);
        try {
            for (var _d = true, _e = __asyncValues(Networker.replySocket), _f; _f = await _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const [msg] = _c;
                    Networker.onRequest.dispatch(message_1.Message.BufferToMessage(msg));
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    static async respondRequest(message) {
        await Networker.replySocket.send(message_1.Message.toJSON(message));
    }
}
exports.Networker = Networker;
Networker.onRequest = new strongly_typed_events_1.SimpleEventDispatcher();
Networker.replySocket = new zeromq_1.Reply;
//# sourceMappingURL=networker.js.map