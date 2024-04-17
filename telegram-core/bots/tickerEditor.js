"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.initiate = void 0;
// @ts-ignore
var TelegramBot = require("node-telegram-bot-api");
// @ts-ignore
var config = require("../../binance_autotrade_v2/config.js");
// @ts-ignore
var strtable = require("string-table");
function initiate() {
    return __awaiter(this, void 0, void 0, function () {
        var bot;
        return __generator(this, function (_a) {
            bot = new TelegramBot(config.ytterlion_token, { polling: true });
            // @ts-ignore
            bot.onText(/\/add (.+)/, function (msg, match) {
                var stringArr = match[1].split(':');
                // @ts-ignore
                if (!/^-?[0-9]+([.][0-9]+)?$/.test(stringArr[1], stringArr[2], stringArr[3])) {
                    bot.sendMessage(msg.chat.id, "You should enter numbers!");
                    return;
                }
                // @ts-ignore
                global.db.read();
                // @ts-ignore
                global.db.get('symbols').__wrapped__.symbols.push({
                    "value": "".concat(stringArr[0].toUpperCase(), "PERP"),
                    "precision": Number(stringArr[1]),
                    "leverage": Number(stringArr[2]),
                    "stop_loss": Number(stringArr[3])
                });
                // @ts-ignore
                var _length = global.db.get('trades').__wrapped__.trades.length + 2;
                // @ts-ignore
                global.db.get('trades').__wrapped__.trades.push({
                    "id": _length,
                    "ticker": stringArr[0],
                    "side": "",
                    "trade_levels": [],
                    "trade_levels_time": [],
                    "stop_loss": null,
                    "exit_price": "",
                    "is_active": true,
                    "quantity": 0,
                    "result": ""
                });
                // @ts-ignore
                global.db.write();
                bot.sendMessage(msg.chat.id, "You've added new trading pair!");
            });
            // @ts-ignore
            bot.onText(/\/delete (.+)/, function (msg, match) {
                // @ts-ignore
                global.db.get('symbols').remove({ "value": "".concat(match[1].toUpperCase(), "PERP") }).write();
                bot.sendMessage(msg.chat.id, "You've removed trading pair");
            });
            // @ts-ignore
            bot.onText(/\/edit (.+)/, function (msg, match) {
                var stringArr = match[1].split(':');
                if (!/^-?[0-9]+([.][0-9]+)?$/.test(stringArr[2])) {
                    bot.sendMessage(msg.chat.id, "You should enter numbers!");
                    return;
                }
                // @ts-ignore
                global.db.get('symbols')
                    .find({ "value": "".concat(stringArr[0].toUpperCase(), "PERP") })
                    .set(stringArr[1].toLowerCase(), Number(stringArr[2]))
                    .write();
                bot.sendMessage(msg.chat.id, "Successfully changed");
            });
            // @ts-ignore
            bot.onText(/\/get_tickers/, function (msg) {
                // @ts-ignore
                var _content = [];
                // @ts-ignore
                global.db.get('symbols').__wrapped__.symbols.forEach(function (ticker) {
                    _content.push({
                        "Ticker": "".concat(ticker.value.replace('PERP', '')),
                        "Leverage": "".concat(ticker.leverage, "x"),
                        "Stop loss": "-".concat(ticker.stop_loss, "%")
                    });
                });
                // @ts-ignore
                bot.sendMessage(msg.chat.id, "<code>".concat(strtable.create(_content), "</code>\n\nTotal amount: ").concat(_content.length), { parse_mode: "HTML" });
            });
            bot.on('polling_error', console.log);
            return [2 /*return*/];
        });
    });
}
exports.initiate = initiate;
