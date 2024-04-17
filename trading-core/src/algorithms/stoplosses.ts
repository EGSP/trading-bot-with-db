import {Ticker} from "../banking/models/tickers/ticker";
import {changeLast, getDatabase, getLast, pushLast} from "../databaseOperator";
import {StoplossV2} from "./models/stoplossV2";
import {math} from "../banking/functions/maths/math";
import getPercentDifferenceAbs = math.getPercentDifferenceAbs;
import addPercent = math.addPercent;
import getPercentile = math.getPercentile;


export function emitStoplossV2(ticker: Ticker, topLevel: number, bottomLevel: number): StoplossV2 | undefined {

    const catalog: string = 'stoploss/v2'
    const db = getDatabase(ticker.getName(), catalog)

    const basePercentDifference = getPercentDifferenceAbs(topLevel, bottomLevel)

    // Берем прошлый стоплосс, чтобы на его основе создать новый
    let stoploss = getLast(db, 'stoplosses') as StoplossV2

    // Если стоплоссов до этого не было, то просто создаем новый
    if (stoploss == undefined) {
        stoploss = new StoplossV2(ticker.getName(), basePercentDifference, Number(new Date().valueOf()))
        pushLast(db,'stoplosses',stoploss)
        return stoploss
    }

    let dynamicOffset = stoploss.dynamicOffset

    // Если динамический стоп меньше обычного канала и составляет 30% от обычного канала и меньше
    if (dynamicOffset < basePercentDifference)
        if (getPercentile(basePercentDifference, 30) > dynamicOffset)
            dynamicOffset = getPercentile(basePercentDifference, 30)

    stoploss = new StoplossV2(stoploss.tickerName, dynamicOffset, Number(new Date().valueOf()))
    pushLast(db,'stoplosses',stoploss)

    return stoploss;
}

export function updateStoplossV2(ticker: Ticker, topLevel: number, bottomLevel: number, resultType : string){
    const catalog: string = 'stoploss/v2'
    const db = getDatabase(ticker.getName(), catalog)

    const stoploss = getLast(db, 'stoplosses') as StoplossV2

    // Получаем значения шагов на основе ширины канала
    const basePercentDifference = getPercentDifferenceAbs(topLevel, bottomLevel)
    let additionalOffset = 0;
    if(resultType == 'profit')
        additionalOffset -= getPercentile(basePercentDifference, 10)
    else if(resultType == 'stop')
        additionalOffset += getPercentile(basePercentDifference, 20)

    changeLast(db,'stoplosses', new StoplossV2(stoploss.tickerName,
        stoploss.dynamicOffset+additionalOffset, Number(new Date().valueOf())))
}

export function getStoplossV2Price(stoploss:StoplossV2, topLevel: number, bottomLevel: number) : number | undefined{
    const direction = topLevel > bottomLevel ? 'long' : 'short'

    if(stoploss == undefined)
        return undefined

    let stoplossPrice;
    if (direction == 'long')
        stoplossPrice = addPercent(bottomLevel, -stoploss.dynamicOffset)
    else
        stoplossPrice = addPercent(bottomLevel, stoploss.dynamicOffset)

    return stoplossPrice
}