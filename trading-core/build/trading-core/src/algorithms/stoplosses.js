Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoplossV2Price = exports.updateStoplossV2 = exports.emitStoplossV2 = void 0;
const databaseOperator_1 = require("../databaseOperator");
const stoplossV2_1 = require("./models/stoplossV2");
const math_1 = require("../banking/functions/maths/math");
var getPercentDifferenceAbs = math_1.math.getPercentDifferenceAbs;
var addPercent = math_1.math.addPercent;
var getPercentile = math_1.math.getPercentile;
function emitStoplossV2(ticker, topLevel, bottomLevel) {
    const catalog = 'stoploss/v2';
    const db = (0, databaseOperator_1.getDatabase)(ticker.getName(), catalog);
    const basePercentDifference = getPercentDifferenceAbs(topLevel, bottomLevel);
    let stoploss = (0, databaseOperator_1.getLast)(db, 'stoplosses');
    if (stoploss == undefined) {
        stoploss = new stoplossV2_1.StoplossV2(ticker.getName(), basePercentDifference, Number(new Date().valueOf()));
        (0, databaseOperator_1.pushLast)(db, 'stoplosses', stoploss);
        return stoploss;
    }
    let dynamicOffset = stoploss.dynamicOffset;
    if (dynamicOffset < basePercentDifference)
        if (getPercentile(basePercentDifference, 30) > dynamicOffset)
            dynamicOffset = getPercentile(basePercentDifference, 30);
    stoploss = new stoplossV2_1.StoplossV2(stoploss.tickerName, dynamicOffset, Number(new Date().valueOf()));
    (0, databaseOperator_1.pushLast)(db, 'stoplosses', stoploss);
    return stoploss;
}
exports.emitStoplossV2 = emitStoplossV2;
function updateStoplossV2(ticker, topLevel, bottomLevel, resultType) {
    const catalog = 'stoploss/v2';
    const db = (0, databaseOperator_1.getDatabase)(ticker.getName(), catalog);
    const stoploss = (0, databaseOperator_1.getLast)(db, 'stoplosses');
    const basePercentDifference = getPercentDifferenceAbs(topLevel, bottomLevel);
    let additionalOffset = 0;
    if (resultType == 'profit')
        additionalOffset -= getPercentile(basePercentDifference, 10);
    else if (resultType == 'stop')
        additionalOffset += getPercentile(basePercentDifference, 20);
    (0, databaseOperator_1.changeLast)(db, 'stoplosses', new stoplossV2_1.StoplossV2(stoploss.tickerName, stoploss.dynamicOffset + additionalOffset, Number(new Date().valueOf())));
}
exports.updateStoplossV2 = updateStoplossV2;
function getStoplossV2Price(stoploss, topLevel, bottomLevel) {
    const direction = topLevel > bottomLevel ? 'long' : 'short';
    if (stoploss == undefined)
        return undefined;
    let stoplossPrice;
    if (direction == 'long')
        stoplossPrice = addPercent(bottomLevel, -stoploss.dynamicOffset);
    else
        stoplossPrice = addPercent(bottomLevel, stoploss.dynamicOffset);
    return stoplossPrice;
}
exports.getStoplossV2Price = getStoplossV2Price;
//# sourceMappingURL=stoplosses.js.map