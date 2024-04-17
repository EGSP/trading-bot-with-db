Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTrade = exports.launchTradeJournal = void 0;
const TelegramBot = require("node-telegram-bot-api");
const config = require("../config");
const networker_1 = require("../../shared/models/network/networker");
const message_1 = require("../../shared/models/network/message");
const messageFormer_1 = require("../src/messageFormer");
async function launchTradeJournal() {
    const bot = new TelegramBot(config.paperfox_token, { polling: true });
    bot.onText(/\/stats/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message(`get/stats`, ""));
        await bot.sendMessage(msg.chat.id, (0, messageFormer_1.formatMessage)(result.query, JSON.parse(result.content)), params);
    });
    bot.onText(/\/get (.+)/, async (msg, match) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message(`get/ticker/stat`, `${match[1].toUpperCase()}`));
        if (JSON.parse(result.content) !== "undefined")
            await bot.sendMessage(msg.chat.id, (0, messageFormer_1.formatMessage)(result.query, JSON.parse(result.content)), params);
        else
            await bot.sendMessage(msg.chat.id, "Not found");
    });
    bot.onText(/\/ping/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message(`action/ping`, ""));
        await bot.sendMessage(msg.chat.id, result.content, params);
    });
    bot.onText(/\/get_pnl (.+)/, async (msg, match) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let _request = msg.text.replace("/get_pnl ", '');
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message('get/pnl/daily', _request));
        if (JSON.parse(result.content))
            await bot.sendMessage(msg.chat.id, (0, messageFormer_1.formatMessage)(result.query, JSON.parse(result.content)), params);
        else
            await bot.sendMessage(msg.chat.id, "Was not found", params);
    });
    bot.onText(/\/graph (.+)/, async (msg, match) => {
        let params = {
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message('get/page/screenshot', match[1] + "USDT"));
        if (result.content)
            await bot.sendPhoto(msg.chat.id, Buffer.from(result.content, 'base64'), params);
        else
            await bot.sendMessage(msg.chat.id, "Ticker was not found", params);
    });
    bot.onText(/\/get_bank/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message("get/bank/real", ""));
        await bot.sendMessage(msg.chat.id, (0, messageFormer_1.formatMessage)(result.query, JSON.parse(result.content)), params);
    });
    bot.onText(/\/get_active/, async (msg) => {
        let params = {
            parse_mode: "HTML",
            reply_to_message_id: msg.message_id
        };
        let result = await networker_1.Networker.request("tcp://127.0.0.1:3000", new message_1.Message("get/trades/active", ""));
        await bot.sendMessage(msg.chat.id, (0, messageFormer_1.formatMessage)(result.query, JSON.parse(result.content)), params);
    });
    bot.on('polling_error', console.log);
    return bot;
}
exports.launchTradeJournal = launchTradeJournal;
function sendTrade(bot, position) {
    position = JSON.parse(position);
    let _msg = `<b>Pair</b>: #${position.ticker}\n<b>Id</b>: #${position.id}\n<code>=========</code>\n<b>${position.side}</b> | <b>${position.extra_params.leverage}</b>x
<code>========</code>\n<b>Orders</b>:\n`;
    position.trade_levels.forEach((price) => { _msg += `\$<i>${price}</i> `; });
    _msg += `<b>μ→</b> \$<i>${position.extra_params.average_order}</i>\n<code>========</code>\n<b>Exit price</b>: \$<i>${position.exit_price}</i> | <b>Stop loss</b>: \$<i>${position.stop_loss}</i>
<code>========</code>\n<b>Quantity</b>: ${Number(position.quantity).toFixed(4)} \$${position.ticker.replace('USDT', '')}\n<code>========</code>
<b>Reason</b>:\n${position.result} #${position.extra_params.text_result}\n<b>Price Change</b>:\n<b>${position.extra_params.price_change}</b>\n
<b>Realized PnL</b>: <i>${Number(position.extra_params.realized_profit).toFixed(4)}</i>\$ | ${position.extra_params.brief_result}`;
    if (position.extra_params.brief_result === "#profit")
        _msg += " | 🟢";
    else if (position.extra_params.brief_result === "#loss")
        _msg += " | 🔴";
    else
        _msg += " | ⚪️";
    bot.sendPhoto(config.telegram_user_id, Buffer.from(position.image, 'base64'), { caption: _msg, parse_mode: "HTML" });
}
exports.sendTrade = sendTrade;
//# sourceMappingURL=tradeJournal.js.map