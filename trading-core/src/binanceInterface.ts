import tradingViewData = require('./tradingViewParse.js');

import dbOperator = require('./databaseOperator.js');
import {getActivePosition, getDatabase, getLast, getLastPositionId, getTickerInfo} from "./databaseOperator";
import {closeTrade} from "./statsModule";
// @ts-ignore
import {Networker} from "../../shared/models/network/networker";
// @ts-ignore
import {Message} from "../../shared/models/network/message";
import {executeBankAccounts, initBinanceClient, placeLimitOrder} from "./binance/util";

export async function sendTradeV2(ticker: string, screenshot: any) {
    let db = getDatabase(ticker, 'trades/tickers');
    let position = getLast(db, 'trades');
    position.image = screenshot.toString();

    await Networker.request("tcp://127.0.0.1:3001", new Message(`action/send/trade`, JSON.stringify(position)));
}

export async function sendLogs(msg) {
    await Networker.request("tcp://127.0.0.1:3001", new Message(`action/send/tech`, msg));
}

function leverage(rawLeverage: any) {
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
                _ticker.leverage = _lev
        });
        global.db.write();

        await global.binanceClient.changeTickerLeverage(ticker.value.replace('PERP', ''), _lev);
    }
    return _lev;
}

async function calculate_position(data: any) {
    let position = getActivePosition(data.ticker);

    let tickerInfo = getTickerInfo(data.ticker);

    if (position.is_active) {
        let ichimoku_filter = ichimoku_check(data);
        //ORDER SIDE
        // @ts-ignore
        if (ichimoku_filter.long === true && data.currentPrice === data.buy[1]) {
            if (position.trade_levels[0] === undefined) //id side + buy
            {
                let _lev = await changeLeverage(tickerInfo, data.leverage);
                dbOperator.positionChange(data.ticker, "extra_params.leverage", _lev);
                let res = await placeLimitOrder(data.ticker, "BUY", data.currentPrice);

                dbOperator.positionChange(data.ticker, "side", "LONG");
                dbOperator.positionChange(data.ticker, "trade_levels[0]", data.currentPrice);
                dbOperator.positionChange(data.ticker, "trade_levels_time[0]", Date.now());
                dbOperator.positionChange(data.ticker, "negativeMaxChange", data.currentPrice);
                dbOperator.positionChange(data.ticker, "take_profit", data.ichi_channel[1]);

                //stop loss
                let stop_loss = Number(data.buy[1]) - (Number(data.ichi_channel[1]) - Number(data.buy[1]))
                dbOperator.positionChange(data.ticker, "stop_loss", Number(stop_loss.toFixed(4)));

                if (res)
                    dbOperator.positionChange(data.ticker, "quantity", Number(res.origQty));
                else
                    dbOperator.positionChange(data.ticker, "quantity", 0);
            }
        } else {
            // @ts-ignore
            if (ichimoku_filter.short === true && data.currentPrice === data.sell[1]) {//short
                if (position.trade_levels[0] === undefined) //id side + sell
                {
                    let _lev = await changeLeverage(tickerInfo, data.leverage);
                    dbOperator.positionChange(data.ticker, "extra_params.leverage", _lev);
                    let res = await placeLimitOrder(data.ticker, "SELL", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "side", "SHORT");
                    dbOperator.positionChange(data.ticker, "trade_levels[0]", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "trade_levels_time[0]", Date.now());
                    dbOperator.positionChange(data.ticker, "negativeMaxChange", data.currentPrice);
                    dbOperator.positionChange(data.ticker, "take_profit", data.ichi_channel[0]);

                    //stop loss
                    let stop_loss = Number(data.sell[1]) + (Number(data.sell[1]) - Number(data.ichi_channel[0]))
                    dbOperator.positionChange(data.ticker, "stop_loss", Number(stop_loss.toFixed(4)));

                    if (res)
                        dbOperator.positionChange(data.ticker, "quantity", Number(res.origQty));
                    else
                        dbOperator.positionChange(data.ticker, "quantity", 0);

                }
            }
        }

        //PROFIT/LOSS SIDE
        if (position.side === "SHORT") {
            if (data.currentPrice >= position.stop_loss) {
                position.is_active = false;
                await closeTrade('❌', "stop_loss", position, data, tickerInfo, data.page);
                //stop loss
            }

            if (data.currentPrice <= Number(position.take_profit)) {
                position.is_active = false;
                await closeTrade('✅', "take_profit", position, data, tickerInfo, data.page);
                //take profit
            }

        } else if (position.side === "LONG") {
            if (data.currentPrice <= position.stop_loss) {
                position.is_active = false;
                await closeTrade('❌', "stop_loss", position, data, tickerInfo, data.page);
                //stop loss
            }

            if (data.currentPrice >= Number(position.take_profit)) {
                position.is_active = false;
                await closeTrade('✅', "take_profit", position, data, tickerInfo, data.page);
                //take profit
            }
        }

        if (position.is_active && position.trade_levels.length > 0) {
            if (position.side === "LONG")
                if (Number(data.filters[0]) > Number(data.buy[0])) {
                    position.is_active = false;
                    await closeTrade('️⚠️', "filter_ichimoku", position, data, tickerInfo, data.page);
                } else if (position.side === "SHORT")
                    if (Number(data.filters[1]) < Number(data.sell[0])) {
                        position.is_active = false;
                        await closeTrade('️⚠️', "filter_ichimoku", position, data, tickerInfo, data.page);
                    }
        }
    } else if (!position.is_active) {
        let db = getDatabase(data.ticker.toUpperCase(), 'trades/tickers');
        db.get().__wrapped__.activeTrade = {
            "id": getLastPositionId(data.ticker) + 1,
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
        }

        db.write();
    }
}

function ichimoku_check(data) {
    let res = {
        "long": false,
        "short": false
    }

    if (Number(data.filters[1]) >= Number(data.sell[1]) && Number(data.middle_ichimoku) >= ((Number(data.sell[0]) + Number(data.ichi_channel[0])) / 2))
        res.short = true;
    if (Number(data.filters[0]) <= Number(data.buy[1]) && Number(data.middle_ichimoku) <= ((Number(data.buy[0]) + Number(data.ichi_channel[1])) / 2))
        res.long = true;

    return res;
}


export async function launch() {
    let data = []; //array of json objects

    executeBankAccounts(33);
    initBinanceClient();

    while (true) {
        for (let i = 0; i < global.pages.length; i++)
            data[i] = await tradingViewData.getTradeInfo(global.pages[i]);

        for (let i = 0; i < data.length; i++)
            await calculate_position(data[i]);
    }
}