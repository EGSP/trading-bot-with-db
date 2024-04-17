"use strict";
exports.__esModule = true;
exports.statStrategy = exports.getTickerCPA = exports.getByDate = void 0;
// @ts-ignore
var dbOperator = require("./databaseOperator.js");
function getByDate(dateInterval) {
    // @ts-ignore
    var trades = global.db.get('trades').filter({ "is_active": false }).value();
    var filteredTrades = [];
    var dates = [];
    dateInterval.split(' ').forEach(function (date) { return dates.push(new Date(date).valueOf()); });
    trades.forEach(function (trade) {
        if (trade.trade_levels_time[0] > dates[0] && trade.trade_levels_time[0] < dates[1])
            filteredTrades.push(trade);
    });
    return filteredTrades;
}
exports.getByDate = getByDate;
function getTickerCPA() {
    var tickers = dbOperator.getAllTickers();
    var tickersData = [];
    tickers.forEach(function (_ticker) {
        var res = statStrategy(_ticker.replace('USDTPERP', ''));
        // @ts-ignore
        tickersData.push({ "ticker": res.ticker, "efficiency": res.profitEff - res.lossEff });
    });
    console.log(tickersData);
}
exports.getTickerCPA = getTickerCPA;
function statStrategy(_ticker) {
    // @ts-ignore
    var trades = global.db.get('trades').filter({ "is_active": false, "ticker": "".concat(_ticker.toUpperCase(), "USDT") }).value();
    var ticker = dbOperator.getTickerInfo("".concat(_ticker.toUpperCase(), "USDT"));
    var sharedTradeData = {};
    // @ts-ignore
    sharedTradeData.profitAmount = 0;
    // @ts-ignore
    sharedTradeData.lossAmount = 0;
    // @ts-ignore
    sharedTradeData.lossAvg = 0;
    // @ts-ignore
    sharedTradeData.profitAvg = 0;
    // @ts-ignore
    sharedTradeData.sumBars = 0;
    // @ts-ignore
    sharedTradeData.sumIchimoku = 0;
    // @ts-ignore
    sharedTradeData.closeActions = [0, 0, 0, 0];
    // @ts-ignore
    sharedTradeData.ticker = "".concat(_ticker.toUpperCase(), "USDT");
    getTotalTrades(trades, sharedTradeData);
    // @ts-ignore
    trades.forEach(function (trade) {
        var tradeData = {};
        getAvgOrder(trade, tradeData);
        getPNL(trade, tradeData, sharedTradeData);
        // @ts-ignore
        getSumRatio(trade, tradeData, sharedTradeData, ticker);
        // @ts-ignore
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
    var _arr = [];
    trade.trade_levels.forEach(function (price, index) {
        _arr[index] = Number(price);
    });
    tradeData.avgorder = (_arr.reduce(function (partialSum, a) { return partialSum + a; }, 0) / _arr.length).toFixed(4);
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
        else { // @ts-ignore
            shared.profitAvg += Math.abs(Number(strategy.per * ticker.leverage * 100).toFixed(2));
        }
    }
}
function getResultInfo(trade, strategy, shared, ticker) {
    if (trade.result === '⌛️')
        shared.sumBars += Number(strategy.per * ticker.leverage * 100);
    if (trade.result === '⚠️')
        shared.sumIchimoku += Number(strategy.per * ticker.leverage * 100);
    if (trade.result === '✅')
        shared.closeActions[0]++;
    if (trade.result === '❌')
        shared.closeActions[1]++;
    if (trade.result === '⌛️')
        shared.closeActions[2]++;
    if (trade.result === '⚠️')
        shared.closeActions[3]++;
}
function getROI(shared) {
    shared.ROI = shared.profitAvg - shared.lossAvg;
}
function getAvgPNL(shared) {
    shared.profitAvg = (shared.profitAvg / shared.profitAmount).toFixed(2); //
    shared.lossAvg = (shared.lossAvg / shared.lossAmount).toFixed(2); //
}
function getAvgPNLPercentage(shared) {
    shared.profitPercentage = ((shared.profitAmount / shared.totaltrades) * 100).toFixed(2);
    shared.lossPercentage = ((shared.lossAmount / shared.totaltrades) * 100).toFixed(2);
}
function getEfficiency(shared) {
    shared.profitEff = ((Number(shared.profitAvg) * Number(shared.profitPercentage)) / 100).toFixed(4);
    shared.lossEff = ((Number(shared.lossAvg) * Number(shared.lossPercentage)) / 100).toFixed(4);
}
module.exports = { getByDate: getByDate, statStrategy: statStrategy, getTickerCPA: getTickerCPA };
