Object.defineProperty(exports, "__esModule", { value: true });
exports.launchTickerEditor = void 0;
const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
async function launchTickerEditor() {
    const bot = new TelegramBot(config.ytterlion_token, { polling: true });
    bot.on('polling_error', console.log);
}
exports.launchTickerEditor = launchTickerEditor;
//# sourceMappingURL=tickerEditor.js.map