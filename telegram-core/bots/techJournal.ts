
import TelegramBot = require('node-telegram-bot-api');

import config = require('../config');

export async function launchTechJournal()
{
    return new TelegramBot(config.ironwolf_token, { polling: true });
}