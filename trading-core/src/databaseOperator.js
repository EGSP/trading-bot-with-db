"use strict";
exports.__esModule = true;
exports.getDynamicStopLoss = exports.Alghoritm2 = exports.Alghoritm = exports.PercentDifferenceAbs = exports.getStat = exports.getStats = exports.positionChange = exports.getLastTradesId = exports.getLastPositionId = exports.getTickerInfo = exports.getAllTickers = void 0;
function getAllTickers() {
    var _tickers = [];
    global.db.read();
    global.db.get("symbols").__wrapped__.symbols.forEach(function (ticker) {
        _tickers.push(ticker.value);
        ticker.value = ticker.value.replace('PERP', '');
        //Alghoritm(3.1, ticker.value);
    });
    return _tickers;
}
exports.getAllTickers = getAllTickers;
function getTickerInfo(ticker) {
    var _tickerinfo;
    global.db.get("symbols").value().forEach(function (_ticker) {
        if (_ticker.value.indexOf('PERP') == -1)
            _ticker.value += "PERP";
        if (_ticker.value == "".concat(ticker.toUpperCase(), "PERP"))
            _tickerinfo = _ticker;
    });
    return _tickerinfo;
}
exports.getTickerInfo = getTickerInfo;
function getLastPositionId(ticker) {
    var _tradesByTicker = [];
    global.db.read();
    global.db.get('trades').__wrapped__.trades.forEach(function (trade) {
        if (trade.ticker === ticker)
            _tradesByTicker.push(trade);
    });
    return _tradesByTicker[_tradesByTicker.length - 1].id;
}
exports.getLastPositionId = getLastPositionId;
function getLastTradesId() {
    var _id = global.db.get('trades').__wrapped__.trades[global.db.get('trades').__wrapped__.trades.length - 1].id;
    return _id;
}
exports.getLastTradesId = getLastTradesId;
function positionChange(id, param, value) {
    global.db.get('trades').find({ "id": id }).set(param, value).write();
}
exports.positionChange = positionChange;
// @ts-ignore
function getStats(tradesArr) {
    var trades;
    if (tradesArr !== undefined)
        trades = tradesArr;
    else {
        trades = global.db.get('trades').value();
    }
    var totalTrades = 0;
    var profitAmount = 0;
    var profitPercentage = 0;
    var lossAmount = 0;
    var lossPercentage = 0;
    var closeActions = [0, 0, 0, 0];
    var profitAvg = 0;
    var lossAvg = 0;
    var ticker;
    var per = 0;
    var sumIchimoku = 0;
    var sumBars = 0;
    var _arr;
    var avgorder = 0;
    trades.forEach(function (trade) {
        if (!trade.is_active) {
            _arr = [];
            trade.trade_levels.forEach(function (price, index) { _arr[index] = Number(price); });
            avgorder = Number((_arr.reduce(function (partialSum, a) { return partialSum + a; }, 0) / _arr.length).toFixed(4));
            totalTrades++;
            ticker = getTickerInfo(trade.ticker);
            if (trade.side === "LONG") {
                if (Number(trade.exit_price) >= avgorder)
                    profitAmount++;
                else if (Number(trade.exit_price) <= avgorder)
                    lossAmount++;
            }
            else if (trade.side === "SHORT") {
                if (Number(trade.exit_price) <= avgorder)
                    profitAmount++;
                else if (Number(trade.exit_price) >= avgorder)
                    lossAmount++;
            }
            per = (avgorder / Number(trade.exit_price)) - 1;
            if (per > 0) {
                if (trade.side === "LONG") {
                    lossAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
                else {
                    profitAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
            }
            else if (per < 0) {
                if (trade.side === "SHORT") {
                    lossAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
                else {
                    profitAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
            }
            if (trade.result === '⌛️') {
                sumBars += Number(per * ticker.leverage * 100);
            }
            if (trade.result === '⚠️') {
                sumIchimoku += Number(per * ticker.leverage * 100);
            }
            if (trade.result === '✅')
                closeActions[0]++;
            if (trade.result === '❌')
                closeActions[1]++;
            if (trade.result === '⌛️')
                closeActions[2]++;
            if (trade.result === '⚠️')
                closeActions[3]++;
        }
    });
    var ROI = profitAvg - lossAvg;
    profitAvg = Number((profitAvg / profitAmount).toFixed(2)); //
    lossAvg = Number((lossAvg / lossAmount).toFixed(2)); //
    profitPercentage = Number(((profitAmount / totalTrades) * 100).toFixed(2));
    lossPercentage = Number(((lossAmount / totalTrades) * 100).toFixed(2));
    var profitEff = (Number(profitAvg) * Number(profitPercentage)) / 100;
    var lossEff = (Number(lossAvg) * Number(lossPercentage)) / 100;
    return "Total trades: <b>".concat(totalTrades, "</b>\nProfit/loss amount: <i>").concat(profitAmount, "</i> <b>|</b> <i>").concat(lossAmount, "</i>\nProfit/loss ratio: <i>").concat(profitPercentage, "%</i> <b>|</b> <i>").concat(lossPercentage, "%</i>\nAverage profit/loss: <i>").concat(profitAvg, "%</i> <b>|</b> <i>").concat(lossAvg, "%</i> | <b>").concat(ROI.toFixed(2), "%</b>\nProfit/loss efficiency: <i>").concat(profitEff.toFixed(2), "</i> <b>|</b> <i>").concat(lossEff.toFixed(2), "</i>\n ").concat(closeActions[0], "\u2705 | ").concat(closeActions[1], "\u274C | ").concat(closeActions[2], "\u231B\uFE0F | ").concat(closeActions[3], "\u26A0\uFE0F \n \nTotal filter performance: <i>").concat(sumBars.toFixed(2), "</i>% \u231B\uFE0F | <i>").concat(sumIchimoku.toFixed(2), "</i>% \u26A0\uFE0F");
}
exports.getStats = getStats;
function getStat(_ticker) {
    var trades = global.db.get('trades').value();
    var totalTrades = 0;
    var totalTradesWithMaxnegative = 0;
    var profitAmount = 0;
    var profitPercentage = 0;
    var lossAmount = 0;
    var lossPercentage = 0;
    var closeActions = [0, 0, 0, 0];
    var profitAvg = 0;
    var lossAvg = 0;
    var ticker;
    var per = 0;
    var dynamicSLeff = 0;
    var _temp = 0;
    var sumIchimoku = 0;
    var sumBars = 0;
    var _arr;
    var avgorder = 0;
    var negativeMaxChange = 0;
    trades.forEach(function (trade) {
        if (!trade.is_active && trade.ticker === _ticker.toUpperCase()) {
            _arr = [];
            trade.trade_levels.forEach(function (price, index) { _arr[index] = Number(price); });
            avgorder = Number((_arr.reduce(function (partialSum, a) { return partialSum + a; }, 0) / _arr.length).toFixed(4));
            totalTrades++;
            ticker = getTickerInfo(trade.ticker);
            if (trade.side === "LONG") {
                if (Number(trade.exit_price) >= avgorder)
                    profitAmount++;
                else if (Number(trade.exit_price) <= avgorder)
                    lossAmount++;
            }
            else if (trade.side === "SHORT") {
                if (Number(trade.exit_price) <= avgorder)
                    profitAmount++;
                else if (Number(trade.exit_price) >= avgorder)
                    lossAmount++;
            }
            per = (avgorder / Number(trade.exit_price)) - 1;
            if (per > 0) {
                if (trade.side === "LONG") {
                    lossAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
                else {
                    profitAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
            }
            else if (per < 0) {
                if (trade.side === "SHORT") {
                    lossAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
                else {
                    profitAvg += Math.abs(Number((per * ticker.leverage * 100).toFixed(2)));
                }
            }
            if (trade.negativeMaxChange !== undefined) {
                totalTradesWithMaxnegative++;
                negativeMaxChange += Math.abs(1 - (avgorder / Number(trade.negativeMaxChange))) * 100;
                var _coef = 0.0035 * 2;
                if (trade.side === "SHORT") {
                    if (trade.negativeMaxChange > (avgorder + Math.round(avgorder * _coef))) {
                        dynamicSLeff += (1 - (avgorder / Math.round(avgorder + Math.round(avgorder * _coef)))) * ticker.leverage * 100;
                        _temp++;
                    }
                }
                else {
                    if (trade.negativeMaxChange < (avgorder - Math.round(avgorder * _coef))) {
                        dynamicSLeff += (1 - (Math.round(avgorder - Math.round(avgorder * _coef)) / avgorder)) * ticker.leverage * 100;
                        _temp++;
                    }
                }
                /*if((Math.abs(1 - (avgorder / Number(trade.negativeMaxChange))) * 100) > 0.35*2)
                {
                    let realperc = (Math.abs(1 - (avgorder / Number(trade.exit_price))) * 100 * ticker.leverage)
                    console.log(realperc.toFixed(2));
                    _temp++;
                    dynamicSLeff += 7 - Math.abs(Number(per * ticker.leverage * 100));
                }*/
            }
            if (trade.result === '⌛️') {
                sumBars += Number(per * ticker.leverage * 100);
            }
            if (trade.result === '⚠️') {
                sumIchimoku += Number(per * ticker.leverage * 100);
            }
            if (trade.result === '✅')
                closeActions[0]++;
            if (trade.result === '❌')
                closeActions[1]++;
            if (trade.result === '⌛️')
                closeActions[2]++;
            if (trade.result === '⚠️')
                closeActions[3]++;
        }
    });
    var ROI = profitAvg - lossAvg;
    negativeMaxChange = negativeMaxChange / totalTradesWithMaxnegative;
    profitAvg = Number((profitAvg / profitAmount).toFixed(2)); //
    lossAvg = Number((lossAvg / lossAmount).toFixed(2)); //
    profitPercentage = Number(((profitAmount / totalTrades) * 100).toFixed(2));
    lossPercentage = Number(((lossAmount / totalTrades) * 100).toFixed(2));
    var profitEff = (Number(profitAvg) * Number(profitPercentage)) / 100;
    var lossEff = (Number(lossAvg) * Number(lossPercentage)) / 100;
    //Alghoritm(2, _ticker);
    var final = "Total trades: <b>".concat(totalTrades, "</b>\nProfit/loss amount: <i>").concat(profitAmount, "</i> <b>|</b> <i>").concat(lossAmount, "</i>\nProfit/loss ratio: <i>").concat(profitPercentage, "%</i> <b>|</b> <i>").concat(lossPercentage, "%</i>\nAverage profit/loss: <i>").concat(profitAvg, "%</i> <b>|</b> <i>").concat(lossAvg, "%</i> | <b>").concat(ROI.toFixed(2), "%</b>\nProfit/loss efficiency: <i>").concat(profitEff.toFixed(2), "</i> <b>|</b> <i>").concat(lossEff.toFixed(2), "</i>\n ").concat(closeActions[0], "\u2705 | ").concat(closeActions[1], "\u274C | ").concat(closeActions[2], "\u231B\uFE0F | ").concat(closeActions[3], "\u26A0\uFE0F \n \nTotal filter performance: <i>").concat(sumBars.toFixed(2), "</i>% \u231B\uFE0F | <i>").concat(sumIchimoku.toFixed(2), "</i>% \u26A0\uFE0F\nNegative max -%: <i>").concat(negativeMaxChange.toFixed(2), "</i>");
    final = final.replace(/NaN/g, '0');
    return final;
}
exports.getStat = getStat;
function PercentDifferenceAbs(a, b) {
    return 100 * (Math.abs(a - b) / (Math.abs(a + b) / 2));
}
exports.PercentDifferenceAbs = PercentDifferenceAbs;
function Alghoritm(factor, _symbol) {
    // factor default value is 2
    // All
    // Average stop-loss for all NegativeChanges
    if (factor === undefined)
        factor = 2;
    var _avg = 0;
    var ticker = getTickerInfo(_symbol);
    var trades = global.db.get('trades').filter({ "ticker": "".concat(_symbol.toUpperCase()) }).value();
    trades.forEach(function (trade) {
        if (trade.negativeMaxChange !== undefined)
            _avg += PercentDifferenceAbs(Number(trade.trade_levels[0]), Number(trade.negativeMaxChange));
    });
    var avgSl = _avg / trades.length;
    // Per trade
    var slProfit = 0; // D - double
    trades.forEach(function (trade) {
        if (trade.negativeMaxChange !== undefined) {
            var nChangeDiff = PercentDifferenceAbs(Number(trade.trade_levels[0]), Number(trade.negativeMaxChange));
            var avgorder = 0;
            trade.trade_levels.forEach(function (price) {
                avgorder += Number(price);
            });
            avgorder /= trade.trade_levels.length;
            var isProfit = -1;
            if ((trade.side === "LONG" && Number(trade.exit_price) > avgorder) || (trade.side === "SHORT" && Number(trade.exit_price) < avgorder))
                isProfit = 1;
            var tradeResult = PercentDifferenceAbs(avgorder, Number(trade.exit_price)) * isProfit;
            //if(tradeResult * ticker.leverage < -10)
            //console.log("tradeRes", (tradeResult * ticker.leverage).toFixed(3), "diff", nChangeDiff.toFixed(3), "avgSl*f" ,(avgSl * factor).toFixed(3))
            if (nChangeDiff > avgSl * factor) {
                var profit = (-avgSl - tradeResult) * ticker.leverage;
                //    console.log("FROM", tradeResult * ticker.leverage, "TO", profit + tradeResult * ticker.leverage);
                slProfit += profit;
            }
        }
    });
    console.log(_symbol, slProfit.toFixed(3), "SAVED");
    return Number(slProfit.toFixed(3));
}
exports.Alghoritm = Alghoritm;
function Alghoritm2(_symbol) {
    var trades = global.db.get('trades').filter({ "ticker": "".concat(_symbol.toUpperCase()) }).value();
    var slProfit = 0;
    trades.forEach(function (trade) {
        if (trade.negativeMaxChange !== undefined) {
            var nChangeDiff = PercentDifferenceAbs(Number(trade.trade_levels[0]), Number(trade.negativeMaxChange));
            if (nChangeDiff > ((20 / 20) / 100)) {
                var avgorder = 0;
                trade.trade_levels.forEach(function (price) {
                    avgorder += Number(price);
                });
                avgorder /= trade.trade_levels.length;
                var isProfit = -1;
                if ((trade.side === "LONG" && Number(trade.exit_price) > avgorder) || (trade.side === "SHORT" && Number(trade.exit_price) < avgorder))
                    isProfit = 1;
                var tradeResult = PercentDifferenceAbs(avgorder, Number(trade.exit_price)) * isProfit;
                // if(isProfit == -1)
                // {
                //     slProfit += tradeResult * 20;
                // }
                var profit = (-1 - tradeResult) * 20;
                slProfit += profit;
                console.log((tradeResult * 20).toFixed(3), profit.toFixed(3));
            }
        }
    });
    return slProfit;
}
exports.Alghoritm2 = Alghoritm2;
function getDynamicStopLoss(factor, _symbol) {
    var _avg = 0;
    var trades = global.db.get('trades').filter({ "ticker": "".concat(_symbol.toUpperCase()) }).value();
    trades.forEach(function (trade) {
        if (trade.negativeMaxChange !== undefined)
            _avg += PercentDifferenceAbs(Number(trade.trade_levels[0]), Number(trade.negativeMaxChange));
    });
    var avgSl = _avg / trades.length;
    return avgSl * factor;
}
exports.getDynamicStopLoss = getDynamicStopLoss;
