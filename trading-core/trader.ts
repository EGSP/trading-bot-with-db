import './q'
import low from "lowdb";
import {decomposeRequest} from "./src/botsModule";
// @ts-ignore
import {Networker} from "../shared/models/network/networker";
// @ts-ignore
import {Message} from "../shared/models/network/message";
import puppeteer = require('puppeteer');
import FileSync = require('lowdb/adapters/FileSync');
import binanceInterface = require('./src/binanceInterface.js');
import {
    binanceMarketOrder, closePosition,
    executeBankAccounts, getTransactionsFromEnd,
    initBinanceClient,
    placeLimitOrder,
    saveTransaction
} from "./src/binance/util";
import {getDatabase, tradingSetState} from "./src/databaseOperator";
import {getRealizedProfit} from "./src/statsModule";

let adapter = new FileSync('data/tradingTickers.json');
global.db = low(adapter);

adapter = new FileSync('data/db.json');
global.userDB = low(adapter);

adapter = new FileSync('data/bank/bank.json');
global.banks = low(adapter);

adapter = new FileSync('data/tradeResults.json');
global.tradeResults = low(adapter);

async function main() {
    global.browser = await puppeteer.launch({headless: true, args: ['--no-sandbox ', '--window-size=1920,1080'], defaultViewport: null});
    global.pages = await require('./src/tradingViewParse').openPages();

    Networker.onRequest.subscribe(async (msg: Message) => {
        let result = await decomposeRequest(msg);
        await Networker.respondRequest(new Message(msg.query, JSON.stringify(result)));
    });

    await Promise.all([
        Networker.bindRequests("tcp://127.0.0.1:3000"),
        binanceInterface.launch()
    ]);
}

main();