Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTech = exports.launchDbEditor = void 0;
const TelegramBot = require("node-telegram-bot-api");
const config = require("../config.js");
async function launchDbEditor() {
    const bot = new TelegramBot(config.blackbird_token, { polling: true });
    return bot;
}
exports.launchDbEditor = launchDbEditor;
function sendTech(bot, res) {
    let _finstr = "";
    res = res.replace(/[{}]/g, '').replace(/[,]/g, '\n').replace(/["]/g, '');
    res = res.split('\n');
    for (let str of res) {
        let _lcstr = str.split('\:');
        _finstr += `<b>${_lcstr[0]}</b>: <code>${_lcstr[1]}</code>\n`;
    }
    bot.sendMessage(config.telegram_user_id, _finstr, {
        reply_to_message_id: 14869,
        parse_mode: "HTML"
    });
}
exports.sendTech = sendTech;
//# sourceMappingURL=dbEditor.js.map