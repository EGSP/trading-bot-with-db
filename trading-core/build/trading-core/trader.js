var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./q");
const lowdb_1 = __importDefault(require("lowdb"));
const botsModule_1 = require("./src/botsModule");
const networker_1 = require("../shared/models/network/networker");
const message_1 = require("../shared/models/network/message");
const puppeteer = require("puppeteer");
const FileSync = require("lowdb/adapters/FileSync");
const binanceInterface = require("./src/binanceInterface.js");
let adapter = new FileSync('data/tradingTickers.json');
global.db = (0, lowdb_1.default)(adapter);
adapter = new FileSync('data/db.json');
global.userDB = (0, lowdb_1.default)(adapter);
adapter = new FileSync('data/bank/bank.json');
global.banks = (0, lowdb_1.default)(adapter);
adapter = new FileSync('data/tradeResults.json');
global.tradeResults = (0, lowdb_1.default)(adapter);
async function main() {
    global.browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox ', '--window-size=1920,1080'], defaultViewport: null });
    global.pages = await require('./src/tradingViewParse').openPages();
    networker_1.Networker.onRequest.subscribe(async (msg) => {
        let result = await (0, botsModule_1.decomposeRequest)(msg);
        await networker_1.Networker.respondRequest(new message_1.Message(msg.query, JSON.stringify(result)));
    });
    await Promise.all([
        networker_1.Networker.bindRequests("tcp://127.0.0.1:3000"),
        binanceInterface.launch()
    ]);
}
main();
//# sourceMappingURL=trader.js.map