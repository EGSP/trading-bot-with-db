Object.defineProperty(exports, "__esModule", { value: true });
exports.launchTechJournal = void 0;
const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
async function launchTechJournal() {
    return new TelegramBot(config.ironwolf_token, { polling: true });
}
exports.launchTechJournal = launchTechJournal;
//# sourceMappingURL=techJournal.js.map