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
exports.getTradeInfo = exports.openPages = void 0;
var database_I = require("./databaseOperator");
function openPages() {
    return __awaiter(this, void 0, void 0, function () {
        var url, _page, _pages, tickers, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://www.tradingview.com/chart/nftmgQKz/?symbol=BINANCE%3A";
                    _pages = [];
                    tickers = database_I.getAllTickers();
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < tickers.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, global.browser.newPage()];
                case 2:
                    _page = _a.sent();
                    return [4 /*yield*/, _page.goto(url + tickers[i])];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, _page.waitForSelector('.price-qqt8UV2f')];
                case 4:
                    _a.sent();
                    _pages.push(_page);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, _pages];
            }
        });
    });
}
exports.openPages = openPages;
function getTradeInfo(page) {
    return __awaiter(this, void 0, void 0, function () {
        var selectors, text, element, i, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    selectors = [];
                    text = [];
                    for (i = 1; i < 8; i++)
                        selectors.push("div.item-G1_Pfvwd:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(".concat(i, ") > div:nth-child(1)"));
                    selectors.push('.title-dFl6z0bt');
                    selectors.push('.price-qqt8UV2f');
                    selectors.push('div.item-G1_Pfvwd:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(7) > div:nth-child(1)');
                    selectors.push('div.item-G1_Pfvwd:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(9) > div:nth-child(1)');
                    selectors.push('div.item-G1_Pfvwd:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div:nth-child(11) > div:nth-child(1)');
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < selectors.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, page.$(selectors[i])];
                case 2:
                    element = _c.sent();
                    _b = (_a = text).push;
                    return [4 /*yield*/, page.evaluate(function (element) { return element.textContent; }, element)];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5:
                    text[7] = text[7].replace('PERP', '');
                    return [2 /*return*/, {
                            "ticker": text[7],
                            "currentPrice": text[8],
                            "middle": text[0],
                            "sell": [
                                text[1],
                                text[2],
                                text[3]
                            ],
                            "buy": [
                                text[4],
                                text[5],
                                text[6]
                            ],
                            "ichimoku": text[9],
                            "filter_ichimoku": {
                                "high": text[10],
                                "low": text[11]
                            }
                        }];
            }
        });
    });
}
exports.getTradeInfo = getTradeInfo;
