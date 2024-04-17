import TelegramBot = require('node-telegram-bot-api');
import config = require('../config.js');

export async function launchDbEditor() {
    const bot = new TelegramBot(config.blackbird_token, { polling: true });
    return bot;
}

export function sendTech(bot, res) {
    let _finstr = "";

    res = res.replace(/[{}]/g, '').replace(/[,]/g, '\n').replace(/["]/g, '');
    res = res.split('\n');

    for(let str of res) {
        let _lcstr = str.split('\:');
        _finstr += `<b>${_lcstr[0]}</b>: <code>${_lcstr[1]}</code>\n`;
    }

    bot.sendMessage(config.telegram_user_id, _finstr, {
        reply_to_message_id: 14869,
        parse_mode: "HTML"
    });
}