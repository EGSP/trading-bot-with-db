Object.defineProperty(exports, "__esModule", { value: true });
require("./q");
const tradeJournal_1 = require("./bots/tradeJournal");
const dbEditor_1 = require("./bots/dbEditor");
const networker_1 = require("../shared/models/network/networker");
const message_1 = require("../shared/models/network/message");
async function main() {
    let tradeJournal = await (0, tradeJournal_1.launchTradeJournal)();
    let dbEditor = await (0, dbEditor_1.launchDbEditor)();
    networker_1.Networker.onRequest.subscribe(async (msg) => {
        if (msg.query === "action/send/trade")
            (0, tradeJournal_1.sendTrade)(tradeJournal, msg.content);
        else if (msg.query === "action/send/tech")
            (0, dbEditor_1.sendTech)(dbEditor, msg.content);
        await networker_1.Networker.respondRequest(new message_1.Message("api/send/trade", "sent"));
    });
    await networker_1.Networker.bindRequests("tcp://127.0.0.1:3001");
}
main();
//# sourceMappingURL=index.js.map