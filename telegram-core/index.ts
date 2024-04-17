import './q';
import {launchTradeJournal, sendTrade} from "./bots/tradeJournal";
import {launchDbEditor, sendTech} from "./bots/dbEditor";
import {launchTickerEditor} from "./bots/tickerEditor";
import {Networker} from "../shared/models/network/networker";
import {Message} from "../shared/models/network/message";

async function main() {
    let tradeJournal = await launchTradeJournal();
    let dbEditor = await launchDbEditor();
    // let tickerEditor = await launchTickerEditor();

    Networker.onRequest.subscribe(async (msg : Message) => {
        if(msg.query === "action/send/trade")
            sendTrade(tradeJournal, msg.content);
        else if(msg.query === "action/send/tech")
            sendTech(dbEditor, msg.content);
        await Networker.respondRequest(new Message("api/send/trade", "sent"));
    });

    await Networker.bindRequests("tcp://127.0.0.1:3001");
}

main();