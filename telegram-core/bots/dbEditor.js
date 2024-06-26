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
exports.operate = void 0;
// @ts-ignore
var TelegramBot = require("node-telegram-bot-api");
// @ts-ignore
var config = require("../../binance_autotrade_v2/config.js");
function operate() {
    return __awaiter(this, void 0, void 0, function () {
        var bot;
        return __generator(this, function (_a) {
            bot = new TelegramBot(config.blackbird_token, { polling: true });
            // @ts-ignore
            bot.onText(/\/margin_type (.+)/, function (msg, match) {
                if (match[1].toUpperCase() === "ISOLATED") {
                    // @ts-ignore
                    global.db.get('user').set("MARGIN_TYPE", match[1].toUpperCase()).write();
                    bot.sendMessage(msg.chat.id, "You have successfully changed margin type to ".concat(match[1].toUpperCase()));
                }
                else if (match[1].toUpperCase() === "CROSS") {
                    // @ts-ignore
                    global.db.get('user').set("MARGIN_TYPE", match[1].toUpperCase()).write();
                    bot.sendMessage(msg.chat.id, "You have successfully changed margin type to ".concat(match[1].toUpperCase()));
                }
                else
                    bot.sendMessage(msg.chat.id, "Please, type either ISOLATED or CROSS, keep in mind that parameter is not register sensible");
            });
            // @ts-ignore
            bot.onText(/\/margin_step (.+)/, function (msg, match) {
                if (/^-?[0-9]+([.][0-9]+)?$/.test(match[1])) {
                    // @ts-ignore
                    global.db.get('user').set("MARGIN_STEP", Number(match[1])).write();
                    bot.sendMessage(msg.chat.id, "Successfully changed margin step to ".concat(match[1]));
                }
                else
                    bot.sendMessage(msg.chat.id, "Please, provide number as a parameter.\nNote: if you are providing float value, please type it with a dot, not a comma");
            });
            // @ts-ignore
            bot.onText(/\/api_keys (.+)/, function (msg, match) {
                // @ts-ignore
                global.db.get('user').set("API.APIKEY", (match[1].split(':'))[0]).write();
                // @ts-ignore
                global.db.get('user').set("API.APISECRET", (match[1].split(':'))[1]).write();
            });
            // @ts-ignore
            bot.onText(/\/activate/, function (msg) {
                // @ts-ignore
                global.db.get('user').set("TRADING_ACTIVE", true).write();
                bot.sendMessage(msg.chat.id, "You have started trading bot");
            });
            // @ts-ignore
            bot.onText(/\/deactivate/, function (msg) {
                // @ts-ignore
                global.db.get('user').set("TRADING_ACTIVE", false).write();
                bot.sendMessage(msg.chat.id, "You have disabled trading bot");
            });
            return [2 /*return*/];
        });
    });
}
exports.operate = operate;
