import dbOperator = require('./databaseOperator.js');
import {archivePosition, getAllTickers, getDatabase, getPositionQuantity, positionChange} from "./databaseOperator";
import {calculateBankAfterTrade} from "./banking/bankingModule";
import {sendLogs, sendTradeV2} from "./binanceInterface";
import {updateStoplossV2} from "./algorithms/stoplosses";
import {Ticker} from "./banking/models/tickers/ticker";
import {Page} from "puppeteer";
import {screenshotPage} from "./tradingViewParse";
import {getTransactionsFromEnd, saveTransaction, updateFuturesAccount} from "./binance/util";

async function wait(timeout) {
    return new Promise<void>(resolve => setTimeout(() => {
        resolve();
    }, timeout * 1000));
}

export function statsStrategy() {
    const tickers = getAllTickers();
    const sumArrays = (arr1, arr2) => {
        arr2.forEach((element, index) => {
            arr1[index] += element;
        });

        return arr1;
    }

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
        let stats: any = statStrategy(`${_ticker.replace('USDTPERP', '')}`);
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

export function statStrategy(_ticker: string) {
    const db = getDatabase(`${_ticker.toUpperCase()}USDT`, 'trades/tickers');
    const trades = db.get('trades').value();
    if(!trades)
        return;
    if (trades.length === 0)
        return undefined;
    const ticker = dbOperator.getTickerInfo(`${_ticker.toUpperCase()}USDT`);
    const sharedTradeData = {}

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
    sharedTradeData.closeActions = [0, 0, 0, 0]

    // @ts-ignore
    sharedTradeData.ticker = `${_ticker.toUpperCase()}USDT`
    getTotalTrades(trades, sharedTradeData);

    trades.forEach((trade) => {
        const tradeData = {}

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

function getTotalTrades(trades: string | any[], shared: { totaltrades?: any; }) {
    shared.totaltrades = trades.length;
}

function getAvgOrder(trade: { trade_levels: any[]; }, tradeData: { avgorder?: any; }) {
    let _arr: any[] = [];
    trade.trade_levels.forEach(function (price, index) {
        _arr[index] = Number(price)
    });
    tradeData.avgorder = (_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4);
}

function getPNL(trade: { side: string; exit_price: any; }, strategy: { avgorder?: any; }, shared: { profitAmount?: any; lossAmount?: any; }) {
    if (trade.side === "LONG") {
        if (Number(trade.exit_price) >= strategy.avgorder)
            shared.profitAmount++;
        else if (Number(trade.exit_price) <= strategy.avgorder)
            shared.lossAmount++;
    } else if (trade.side === "SHORT") {
        if (Number(trade.exit_price) <= strategy.avgorder)
            shared.profitAmount++;
        else if (Number(trade.exit_price) >= strategy.avgorder)
            shared.lossAmount++;
    }
}

function getSumRatio(trade: { exit_price: any; side: string; }, strategy: { per?: any; avgorder?: any; }, shared: { lossAvg?: any; profitAvg?: any; }, ticker: { leverage: number; }) {
    strategy.per = (strategy.avgorder / Number(trade.exit_price)) - 1;
    if (strategy.per > 0) {
        if (trade.side === "LONG")
            shared.lossAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        else
            shared.profitAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
    } else if (strategy.per < 0) {
        if (trade.side === "SHORT")
            shared.lossAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        else {
            shared.profitAvg += Math.abs(Number(Number(strategy.per * ticker.leverage * 100).toFixed(2)));
        }
    }
}

function getResultInfo(trade: any, strategy: { per?: any; }, shared: { sumBars?: any; sumIchimoku?: any; closeActions?: any; }, ticker: { leverage: number; }) {
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

function getROI(shared: { ROI?: any; profitAvg?: any; lossAvg?: any; }) {
    shared.ROI = shared.profitAvg - shared.lossAvg;
}

function getAvgPNL(shared: { profitAvg?: any; profitAmount?: any; lossAvg?: any; lossAmount?: any; }) {
    shared.profitAvg = (shared.profitAvg / shared.profitAmount).toFixed(2); //
    shared.lossAvg = (shared.lossAvg / shared.lossAmount).toFixed(2); //
}

function getAvgPNLPercentage(shared: { profitPercentage?: any; profitAmount?: any; totaltrades?: any; lossPercentage?: any; lossAmount?: any; }) {
    shared.profitPercentage = ((shared.profitAmount / shared.totaltrades) * 100).toFixed(2);
    shared.lossPercentage = ((shared.lossAmount / shared.totaltrades) * 100).toFixed(2);
}

function getEfficiency(shared: { profitEff?: any; profitAvg?: any; profitPercentage?: any; lossEff?: any; lossAvg?: any; lossPercentage?: any; }) {
    shared.profitEff = ((Number(shared.profitAvg) * Number(shared.profitPercentage)) / 100).toFixed(4);
    shared.lossEff = ((Number(shared.lossAvg) * Number(shared.lossPercentage)) / 100).toFixed(4);
}

function calculateLocalData(position, textRes, exit_price, realpnl) {
    let _arr = [];
    position = getPositionQuantity(position.ticker);
    position.trade_levels.forEach((price) => {
        _arr.push(Number(price))
    });

    let avgOrder: number = Number((_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4));
    let priceChange = `${(((1 - (avgOrder / Number(exit_price))) * 100) * Number(position.extra_params.leverage)).toFixed(2)}%`
    let profit : any = 0;

    if(realpnl !== 0)
        profit = realpnl > 0 ? "#profit" : "#loss"


    positionChange(position.ticker, "extra_params.average_order", avgOrder);
    positionChange(position.ticker, "extra_params.price_change", priceChange);
    positionChange(position.ticker, "extra_params.realized_profit", realpnl);
    positionChange(position.ticker, "extra_params.text_result", textRes);
    positionChange(position.ticker, "extra_params.brief_result", profit);
}

export async function closeTrade(result, textRes, position, data, ticker, page : Page) {
    positionChange(data.ticker, "is_active", false);
    positionChange(data.ticker, "result", result);

    let _side = position.side === "LONG" ? "SELL" : "BUY";
    let tradingActive: boolean = global.userDB.get('user').value().trading_active;
    let positionQuantity = Number(position.quantity);

    let realized_profit = 0;
    if(tradingActive) {
        realized_profit = await getRealizedProfit(data.ticker);
        let res = await global.binanceClient.placeCloseMarketOrder(data.ticker, _side, Number((Math.round(positionQuantity * 100) / 100).toFixed(ticker.precision)));
        saveTransaction(data.ticker, JSON.stringify(res));
        await sendLogs(JSON.stringify(res));

        updateFuturesAccount(data.ticker, realized_profit, 33);
    }

    let screenshot = await screenshotPage(data.ticker);

    if (textRes !== "stop_loss")
        positionChange(data.ticker, "exit_price", data.currentPrice);
    else
        positionChange(data.ticker, "exit_price", Number(position.stop_loss));

    calculateLocalData(position, textRes, data.currentPrice, realized_profit);
    archivePosition(data.ticker);

    await sendTradeV2(data.ticker, screenshot);
}

export async function getRealizedProfit(ticker) : Promise<number> {
    let profit : number = 0;
    await new Promise((res) => {setTimeout(res, 4000)});
    let trades = await global.binanceClient.getUserTrades(ticker, undefined, undefined, undefined, 10).then(r => r.reverse());
    let orderObjs = [];

    let firstside = trades[0].side;
    let secondside = firstside === "BUY" ? "SELL" : "BUY";

    for(let trade of trades) {
        if(trade.side === firstside) {
            orderObjs.push(trade);
            trades.shift();
        }
        else if(trade.side !== firstside)
            break;
    }

    for(let trade of trades) {
        if(trade.side === secondside && trade.buyer !== true) {
            orderObjs.push(trade);
            trades.shift();
        }
        else if(trade.side !== secondside || trade.buyer === true)
            break;
    }

    for(let order of orderObjs) {
        profit += Number(order.realizedPnl);
        profit -= Number(order.commission);
    }

    return Number(profit.toFixed(3));
}