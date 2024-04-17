import TelegramBot = require('node-telegram-bot-api');
import config = require('../config');
import {Networker} from "../../shared/models/network/networker";
import {Message} from "../../shared/models/network/message";
import {formatMessage} from "../src/messageFormer";

export async function launchTradeJournal()
{
    const bot = new TelegramBot(config.paperfox_token, { polling: true });

    bot.onText(/\/stats/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        // @ts-ignore
        let result = await Networker.request("tcp://127.0.0.1:3000", new Message(`get/stats`, ""));
        await bot.sendMessage(msg.chat.id, formatMessage(result.query, JSON.parse(result.content)), params);
    });

    bot.onText(/\/get (.+)/, async (msg, match) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        let result = await Networker.request("tcp://127.0.0.1:3000", new Message(`get/ticker/stat`, `${match[1].toUpperCase()}`));
        if(JSON.parse(result.content) !== "undefined")
            await bot.sendMessage(msg.chat.id, formatMessage(result.query, JSON.parse(result.content)), params);
        else
            await bot.sendMessage(msg.chat.id, "Not found");
    });

    bot.onText(/\/ping/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        let result = await Networker.request("tcp://127.0.0.1:3000", new Message(`action/ping`, ""));
        await bot.sendMessage(msg.chat.id, result.content, params);
    });

    bot.onText(/\/get_pnl (.+)/, async (msg, match) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        let _request = msg.text.replace("/get_pnl ", '');
        let result = await Networker.request("tcp://127.0.0.1:3000", new Message('get/pnl/daily', _request));
        if(JSON.parse(result.content))
            await bot.sendMessage(msg.chat.id, formatMessage(result.query, JSON.parse(result.content)), params);
        else
            await bot.sendMessage(msg.chat.id, "Was not found", params);
    });

    bot.onText(/\/graph (.+)/, async (msg, match) => {
       let params = {
           reply_to_message_id: msg.message_id
       }

       let result = await Networker.request("tcp://127.0.0.1:3000", new Message('get/page/screenshot', match[1] + "USDT"));
       if(result.content)
           await bot.sendPhoto(msg.chat.id, Buffer.from(result.content, 'base64'), params);
       else
           await bot.sendMessage(msg.chat.id, "Ticker was not found", params);
    });

    bot.onText(/\/get_bank/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        let result = await Networker.request("tcp://127.0.0.1:3000", new Message("get/bank/real", ""));
        await bot.sendMessage(msg.chat.id, formatMessage(result.query, JSON.parse(result.content)), params);
    });

    bot.onText(/\/get_active/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        }

        let result = await Networker.request("tcp://127.0.0.1:3000", new Message("get/trades/active", ""));
        await bot.sendMessage(msg.chat.id, formatMessage(result.query, JSON.parse(result.content)), params);
    });

    // bot.onText(/\/start_trading/, async (msg) => {
    //     let params = {
    //         parse_mode: "HTML",
    //         reply_to_message_id: msg.message_id
    //     }
    //
    //     let result = await Networker.request("tcp://127.0.0.1:3000", new Message("trading/start", ""));
    //     await bot.sendMessage(msg.chat.id, "Started trading", params);
    // });
    //
    // bot.onText(/\/stop_trading/, async (msg) => {
    //     let params = {
    //         parse_mode: "HTML",
    //         reply_to_message_id: msg.message_id
    //     }
    //
    //     let result = await Networker.request("tcp://127.0.0.1:3000", new Message("trading/stop", ""));
    //     await bot.sendMessage(msg.chat.id, "Stopped trading", params);
    // });

    bot.on('polling_error', console.log);

    return bot;
}

export function sendTrade(bot : TelegramBot, position : any) {
    position = JSON.parse(position);
    let _msg = `<b>Pair</b>: #${position.ticker}\n<b>Id</b>: #${position.id}\n<code>=========</code>\n<b>${position.side}</b> | <b>${position.extra_params.leverage}</b>x
<code>========</code>\n<b>Orders</b>:\n`
    position.trade_levels.forEach((price) => { _msg += `\$<i>${price}</i> `});
    _msg += `<b>μ→</b> \$<i>${position.extra_params.average_order}</i>\n<code>========</code>\n<b>Exit price</b>: \$<i>${position.exit_price}</i> | <b>Stop loss</b>: \$<i>${position.stop_loss}</i>
<code>========</code>\n<b>Quantity</b>: ${Number(position.quantity).toFixed(4)} \$${position.ticker.replace('USDT', '')}\n<code>========</code>
<b>Reason</b>:\n${position.result} #${position.extra_params.text_result}\n<b>Price Change</b>:\n<b>${position.extra_params.price_change}</b>\n
<b>Realized PnL</b>: <i>${Number(position.extra_params.realized_profit).toFixed(4)}</i>\$ | ${position.extra_params.brief_result}`;

    if(position.extra_params.brief_result === "#profit")
        _msg += " | 🟢"
    else if(position.extra_params.brief_result === "#loss")
        _msg += " | 🔴"
    else
        _msg += " | ⚪️"

    bot.sendPhoto(config.telegram_user_id, Buffer.from(position.image, 'base64'), { caption: _msg, parse_mode: "HTML" });
}
