Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = exports.sendLogs = exports.sendTradeV2 = void 0;
const tradingViewData = require("./tradingViewParse.js");
const dbOperator = require("./databaseOperator.js");
const databaseOperator_1 = require("./databaseOperator");
const statsModule_1 = require("./statsModule");
const networker_1 = require("../../shared/models/network/networker");
const message_1 = require("../../shared/models/network/message");
const util_1 = require("./binance/util");
async function sendTradeV2(ticker, screenshot) {
    let db = (0, databaseOperator_1.getDatabase)(ticker, 'trades/tickers');
    let position = (0, databaseOperator_1.getLast)(db, 'trades');
    position.image = screenshot.toString();
    await networker_1.Networker.request("tcp://127.0.0.1:3001", new message_1.Message(`action/send/trade`, JSON.stringify(position)));
}
exports.sendTradeV2 = sendTradeV2;
async function sendLogs(msg) {
    await networker_1.Networker.request("tcp://127.0.0.1:3001", new message_1.Message(`action/send/tech`, msg));
}
exports.sendLogs = sendLogs;
function leverage(rawLeverage) {
    rawLeverage = Number(rawLeverage);
    if (rawLeverage < 5)
        return 5;
    else if (rawLeverage > 50)
        return 50;
    else
        return rawLeverage;
}
async function changeLeverage(ticker, lev) {
    let _lev = leverage(lev);
    if (_lev > ticker.maxLeverage)
        _lev = ticker.maxLeverage;
    if (ticker.leverage !== _lev) {
        global.db.get("symbols").value().forEach(function (_ticker) {
            if (ticker.value == _ticker.value)
                _ticker.leverage = _lev;
        });
        global.db.write();
        await global.binanceClient.changeTickerLeverage(ticker.value.replace('PERP', ''), _lev);
    }
    return _lev;
}
async function calculate_position(data) {
    let position = (0, databaseOperator_1.getActivePosition)(data.ticker);
    let tickerInfo = (0, databaseOperator_1.getTickerInfo)(data.ticker);
    if (position.is_active) {
        let ichimoku_filter = ichimoku_check(data);
        if (ichimoku_filter.long === true && data.currentPrice === data.buy[1]) {
            if (position.trade_levels[0] === undefined) {
                let _lev = await changeLeverage(tickerInfo, data.leverage);
                dbOperator.positionChange(data.ticker, "extra_params.leverage", _lev);
                let res = await (0, util_1.placeLimitOrder)(data.ticker, "BUY", data.currentPrice);
                dbOperator.positionChange(data.ticker, "side", "LONG");
                dbOperator.positionChange(data.ticker, "trade_levels[0]", data.currentPrice);
                dbOperator.positionChange(data.ticker, "trade_levels_time[0]", Date.now());
                dbOperator.positionChange(data.ticker, "negativeMaxChange", data.currentPrice);
                dbOperator.positionChange(data.ticker, "take_profit", data.ichi_channel[1]);
                let stop_loss = Number(data.buy[1]) - (Number(data.ichi_channel[1]) - Number(data.buy[1]));
                dbOperator.positionChange(data.ticker, "stop_loss", Number(stop_loss.toFixed(4)));
                if (res)
                    dbOperator.positionChange(data.ticker, "quantity", Number(res.origQty));
                else
                    dbOperator.positionChange(data.ticker, "quantity", 0);
            }
        }
        else {
            if (ichimoku_filter.short === true && data.currentPrice === data.sell[1]) {
                if (position.trade_levels[0] === undefined) {
                    let _lev = await changeLeverage(tickerInfo, data.leverage);
                    dbOperator.positionChange(data.ticker, "extra_params.leverage", _lev);
                    let res = await (0, util_1.placeLimitOrder)(data.ticker, "SELL", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "side", "SHORT");
                    dbOperator.positionChange(data.ticker, "trade_levels[0]", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "trade_levels_time[0]", Date.now());
                    dbOperator.positionChange(data.ticker, "negativeMaxChange", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "take_profit", data.ichi_channel[0]);
                    let stop_loss = Number(data.sell[1]) + (Number(data.sell[1]) - Number(data.ichi_channel[0]));
                    dbOperator.positionChange(data.ticker, "stop_loss", Number(stop_loss.toFixed(4)));
                    if (res)
                        dbOperator.positionChange(data.ticker, "quantity", Number(res.origQty));
                    else
                        dbOperator.positionChange(data.ticker, "quantity", 0);
                }
            }
        }
        if (position.side === "SHORT") {
            if (data.currentPrice >= position.stop_loss) {
                position.is_active = false;
                await (0, statsModule_1.closeTrade)('❌', "stop_loss", position, data, tickerInfo, data.page);
            }
            if (data.currentPrice <= Number(position.take_profit)) {
                position.is_active = false;
                await (0, statsModule_1.closeTrade)('✅', "take_profit", position, data, tickerInfo, data.page);
            }
        }
        else if (position.side === "LONG") {
            if (data.currentPrice <= position.stop_loss) {
                position.is_active = false;
                await (0, statsModule_1.closeTrade)('❌', "stop_loss", position, data, tickerInfo, data.page);
            }
            if (data.currentPrice >= Number(position.take_profit)) {
                position.is_active = false;
                await (0, statsModule_1.closeTrade)('✅', "take_profit", position, data, tickerInfo, data.page);
            }
        }
        if (position.is_active && position.trade_levels.length > 0) {
            if (position.side === "LONG")
                if (Number(data.filters[0]) > Number(data.buy[0])) {
                    position.is_active = false;
                    await (0, statsModule_1.closeTrade)('️⚠️', "filter_ichimoku", position, data, tickerInfo, data.page);
                }
                else if (position.side === "SHORT")
                    if (Number(data.filters[1]) < Number(data.sell[0])) {
                        position.is_active = false;
                        await (0, statsModule_1.closeTrade)('️⚠️', "filter_ichimoku", position, data, tickerInfo, data.page);
                    }
        }
    }
    else if (!position.is_active) {
        let db = (0, databaseOperator_1.getDatabase)(data.ticker.toUpperCase(), 'trades/tickers');
        db.get().__wrapped__.activeTrade = {
            "id": (0, databaseOperator_1.getLastPositionId)(data.ticker) + 1,
            "ticker": data.ticker,
            "side": "",
            "trade_levels": [],
            "trade_levels_time": [],
            "stop_loss": null,
            "take_profit": null,
            "exit_price": "",
            "is_active": true,
            "quantity": 0,
            "result": "",
            "extra_params": {
                "average_order": "",
                "price_change": "",
                "realized_profit": "",
                "leverage": 0,
                "text_result": "",
                "brief_result": ""
            }
        };
        db.write();
    }
}
function ichimoku_check(data) {
    let res = {
        "long": false,
        "short": false
    };
    if (Number(data.filters[1]) >= Number(data.sell[1]) && Number(data.middle_ichimoku) >= ((Number(data.sell[0]) + Number(data.ichi_channel[0])) / 2))
        res.short = true;
    if (Number(data.filters[0]) <= Number(data.buy[1]) && Number(data.middle_ichimoku) <= ((Number(data.buy[0]) + Number(data.ichi_channel[1])) / 2))
        res.long = true;
    return res;
}
async function launch() {
    let data = [];
    (0, util_1.executeBankAccounts)(33);
    (0, util_1.initBinanceClient)();
    while (true) {
        for (let i = 0; i < global.pages.length; i++)
            data[i] = await tradingViewData.getTradeInfo(global.pages[i]);
        for (let i = 0; i < data.length; i++)
            await calculate_position(data[i]);
    }
}
exports.launch = launch;
//# sourceMappingURL=binanceInterface.js.map