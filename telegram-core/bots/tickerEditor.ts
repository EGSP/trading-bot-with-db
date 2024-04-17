import TelegramBot = require('node-telegram-bot-api');
import config = require('../config');
import {Networker} from "../../shared/models/network/networker";
import {Message} from "../../shared/models/network/message";

export async function launchTickerEditor() {
    const bot = new TelegramBot(config.ytterlion_token, { polling: true });

    bot.on('polling_error', console.log);
}