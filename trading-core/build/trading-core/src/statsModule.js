Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealizedProfit = exports.closeTrade = exports.statStrategy = exports.statsStrategy = void 0;
const dbOperator = require("./databaseOperator.js");
const databaseOperator_1 = require("./databaseOperator");
const binanceInterface_1 = require("./binanceInterface");
const tradingViewParse_1 = require("./tradingViewParse");
const util_1 = require("./binance/util");
async function wait(timeout) {
    return new Promise(resolve => setTimeout(() => {
        resolve();
    }, timeout * 1000));
}
function statsStrategy() {
    const tickers = (0, databaseOperator_1.getAllTickers)();
    const sumArrays = (arr1, arr2) => {
        arr2.forEach((element, index) => {
            arr1[index] += element;
        });
        return arr1;
    };
    let _definedStats = 0;
    let totalData = {
        totalTrades: 0,
        profitAmount: 0,
        lossAmount: 0,
        profitRatio: 0,
        lossRatio: 0,
        closeActions: [0, 0, 0, 0],
        sumBars: 0,
        sumIchimoku: 0
    };
    tickers.forEach((_ticker) => {
        let stats = statStrategy(`${_ticker.replace('USDTPERP', '')}`);
        if (stats) {
            _definedStats++;
            totalData.totalTrades += stats.profitAmount + stats.lossAmount;
            totalData.profitAmount += stats.profitAmount;
            totalData.lossAmount += stats.lossAmount;
            totalData.profitRatio += Number(stats.profitPercentage);
            totalData.lossRatio += Number(stats.lossPercentage);
            totalData.closeActions = sumArrays(totalData.closeActions, stats.closeActions);
            totalData.sumBars += stats.sumBars;
            totalData.sumIchimoku += stats.sumIchimoku;
        }
    });
    totalData.profitRatio /= _definedStats;
    totalData.lossRatio /= _definedStats;
    return totalData;
}
exports.statsStrategy = statsStrategy;
function statStrategy(_ticker) {
    const db = (0, databaseOperator_1.getDatabase)(`${_ticker.toUpperCase()}USDT`, 'trades/tickers');
    const trades = db.get('trades').value();
    if (!trades)
        return;
    if (trades.length === 0)
        return undefined;
    const ticker = dbOperator.getTickerInfo(`${_ticker.toUpperCase()}USDT`);
    const sharedTradeData = {};
    sharedTradeData.profitAmount = 0;
    sharedTradeData.lossAmount = 0;
    sharedTradeData.lossAvg = 0;
    sharedTradeData.profitAvg = 0;
    sharedTradeData.sumBars = 0;
    sharedTradeData.sumIchimoku = 0;
    sharedTradeData.closeActions = [0, 0, 0, 0];
    sharedTradeData.ticker = `${_ticker.toUpperCase()}USDT`;
    getTotalTrades(trades, sharedTradeData);
    trades.forEach((trade) => {
        const tradeData = {};
        getAvgOrder(trade, tradeData);
        getPNL(trade, tradeData, sharedTradeData);
        getSumRatio(trade, tradeData, sharedTradeData, ticker);
        getResultInfo(trade, tradeData, sharedTradeData, ticker);
    });
    getROI(sharedTradeData);
    getAvgPNL(sharedTradeData);
    getAvgPNLPercentage(sharedTradeData);
    getEfficiency(sharedTradeData);
    return sharedTradeData;
}
exports.statStrategy = statStrategy;
function getTotalTrades(trades, shared) {
    shared.totaltrades = trades.length;
}
function getAvgOrder(trade, tradeData) {
    let _arr = [];
    trade.trade_levels.forEach(function (price, index) {
        _arr[index] = Number(price);
    });
    tradeData.avgorder = (_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4);
}
function getPNL(trade, strategy, shared) {
    if (trade.side === "LONG") {
        if (Number(trade.exit_price) >= strategy.avgorder)
            shared.profitAmount++;
        else if (Number(trade.exit_price) <= strategy.avgorder)
            shared.lossAmount++;
    }
    else if (trade.side === "SHORT") {
        if (Number(trade.exit_price) <= strategy.avgorder)
            shared.profitAmount++;
        else if (Number(trade.exit_price) >= strategy.avgorder)
            shared.lossAmount++;
    }
}
function getSumRatio(trade, strategy, shared, ticker) {
    strategy.per = (strategy.avgorder / Number(trade.exit_price)) - 1;
    if (strategy.per > 0) {
        if (trade.side === "LONG")
            shared.lossAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        else
            shared.profitAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
    }
    else if (strategy.per < 0) {
        if (trade.side === "SHORT")
            shared.lossAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        else {
            shared.profitAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        }
    }
}
function getResultInfo(trade, strategy, shared, ticker) {
    if (trade.extra_params.text_result === 'filter_20_bar')
        shared.sumBars += Number(strategy.per * ticker.leverage * 100);
    if (trade.extra_params.text_result === 'filter_ichimoku')
        shared.sumIchimoku += Number(strategy.per * ticker.leverage * 100);
    if (trade.extra_params.text_result === 'take_profit')
        shared.closeActions[0]++;
    if (trade.extra_params.text_result === 'stop_loss')
        shared.closeActions[1]++;
    if (trade.extra_params.text_result === 'filter_20_bar')
        shared.closeActions[2]++;
    if (trade.extra_params.text_result === 'filter_ichimoku')
        shared.closeActions[3]++;
}
function getROI(shared) {
    shared.ROI = shared.profitAvg - shared.lossAvg;
}
function getAvgPNL(shared) {
    shared.profitAvg = (shared.profitAvg / shared.profitAmount).toFixed(2);
    shared.lossAvg = (shared.lossAvg / shared.lossAmount).toFixed(2);
}
function getAvgPNLPercentage(shared) {
    shared.profitPercentage = ((shared.profitAmount / shared.totaltrades) * 100).toFixed(2);
    shared.lossPercentage = ((shared.lossAmount / shared.totaltrades) * 100).toFixed(2);
}
function getEfficiency(shared) {
    shared.profitEff = ((Number(shared.profitAvg) * Number(shared.profitPercentage)) / 100).toFixed(4);
    shared.lossEff = ((Number(shared.lossAvg) * Number(shared.lossPercentage)) / 100).toFixed(4);
}
function calculateLocalData(position, textRes, exit_price, realpnl) {
    let _arr = [];
    position = (0, databaseOperator_1.getPositionQuantity)(position.ticker);
    position.trade_levels.forEach((price) => {
        _arr.push(Number(price));
    });
    let avgOrder = Number((_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4));
    let priceChange = `${(((1 - (avgOrder / Number(exit_price))) * 100) * Number(position.extra_params.leverage)).toFixed(2)}%`;
    let profit = 0;
    if (realpnl !== 0)
        profit = realpnl > 0 ? "#profit" : "#loss";
    (0, databaseOperator_1.positionChange)(position.ticker, "extra_params.average_order", avgOrder);
    (0, databaseOperator_1.positionChange)(position.ticker, "extra_params.price_change", priceChange);
    (0, databaseOperator_1.positionChange)(position.ticker, "extra_params.realized_profit", realpnl);
    (0, databaseOperator_1.positionChange)(position.ticker, "extra_params.text_result", textRes);
    (0, databaseOperator_1.positionChange)(position.ticker, "extra_params.brief_result", profit);
}
async function closeTrade(result, textRes, position, data, ticker, page) {
    (0, databaseOperator_1.positionChange)(data.ticker, "is_active", false);
    (0, databaseOperator_1.positionChange)(data.ticker, "result", result);
    let _side = position.side === "LONG" ? "SELL" : "BUY";
    let tradingActive = global.userDB.get('user').value().trading_active;
    let positionQuantity = Number(position.quantity);
    let realized_profit = 0;
    if (tradingActive) {
        realized_profit = await getRealizedProfit(data.ticker);
        let res = await global.binanceClient.placeCloseMarketOrder(data.ticker, _side, Number((Math.round(positionQuantity * 100) / 100).toFixed(ticker.precision)));
        (0, util_1.saveTransaction)(data.ticker, JSON.stringify(res));
        await (0, binanceInterface_1.sendLogs)(JSON.stringify(res));
        (0, util_1.updateFuturesAccount)(data.ticker, realized_profit, 33);
    }
    let screenshot = await (0, tradingViewParse_1.screenshotPage)(data.ticker);
    if (textRes !== "stop_loss")
        (0, databaseOperator_1.positionChange)(data.ticker, "exit_price", data.currentPrice);
    else
        (0, databaseOperator_1.positionChange)(data.ticker, "exit_price", Number(position.stop_loss));
    calculateLocalData(position, textRes, data.currentPrice, realized_profit);
    (0, databaseOperator_1.archivePosition)(data.ticker);
    await (0, binanceInterface_1.sendTradeV2)(data.ticker, screenshot);
}
exports.closeTrade = closeTrade;
async function getRealizedProfit(ticker) {
    let profit = 0;
    await new Promise((res) => { setTimeout(res, 4000); });
    let trades = await global.binanceClient.getUserTrades(ticker, undefined, undefined, undefined, 10).then(r => r.reverse());
    let orderObjs = [];
    let firstside = trades[0].side;
    let secondside = firstside === "BUY" ? "SELL" : "BUY";
    for (let trade of trades) {
        if (trade.side === firstside) {
            orderObjs.push(trade);
            trades.shift();
        }
        else if (trade.side !== firstside)
            break;
    }
    for (let trade of trades) {
        if (trade.side === secondside && trade.buyer !== true) {
            orderObjs.push(trade);
            trades.shift();
        }
        else if (trade.side !== secondside || trade.buyer === true)
            break;
    }
    for (let order of orderObjs) {
        profit += Number(order.realizedPnl);
        profit -= Number(order.commission);
    }
    return Number(profit.toFixed(3));
}
exports.getRealizedProfit = getRealizedProfit;
//# sourceMappingURL=statsModule.js.map