import {Bank} from "./models/banks/virtual/bank";
import {Ticker} from "./models/tickers/ticker";
import {doWithdrawChunks, getMargin} from "./functions/banks/functions";
import {changeBankBalance, exportTradeResult, getDatabase} from "../databaseOperator";
import config = require('../../config');

export function initCoinBanks() {
    let _arr = [];
    global.banks.get('banks').value().forEach((bank) => {
        const ticker = new Ticker(bank.ticker.first, bank.ticker.last);
        let _bank = new Bank(ticker, bank.account);
        _arr.push(_bank);
    });
    return _arr;
}

function updateCoinBankAccount(symbol: string, amount: number) {
    global._banks.forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase()) {
            bank.account += amount;
        }
    });
}

export function takeAllChunks() {
    global._banks.forEach((bank) => {
        let _chunk = getMargin(bank, 3, 33, 12);

        if (!_chunk)
            return;

        doWithdrawChunks(bank, _chunk);

        global._chunk.push({
            chunk: _chunk,
            symbol: `${bank.ticker.first}${bank.ticker.last}`
        });
    });
}


export function takeChunk(symbol, index) {
    global.banks.get('banks').value().forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase()) {
            //УЕБИЩНЫЙ ФИКС В 4 УТРА
            let _bank = new Bank(new Ticker(bank.ticker.first, bank.ticker.last), bank.account);
            //
            let _chunk = getMargin(_bank, 3, 33, 12);

            if (!_chunk)
                return;

            global._chunk[index] = {
                chunk: _chunk,
                symbol: `${bank.ticker.first}${bank.ticker.last}`
            }
        }
    });
}

export function getChunkToSymbol(symbol: string, index: number) {
    let amount: number = 0;
    global._chunk.forEach((chunk) => {
        if (chunk.symbol === symbol.toUpperCase())
            amount = chunk.chunk[index];
    });

    return amount;
}

export function calculateBankAfterTrade(trade_levels, exit_price, leverage, symbol, side) {
    let _arr = [];
    let sumOfUsedChunks = 0;
    let sumOfUsedChunksAfter = 0;
    let indexOfChunk: number;
    symbol = symbol.toUpperCase();

    trade_levels.forEach((trade_level) => {
        _arr.push(Number(trade_level));
    });

    let avgOrder: number = Number((_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4));
    let actualPriceChange = (((1 - (avgOrder / Number(exit_price)))) * leverage);

    if (side === "LONG") {
        if (avgOrder < Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange);
        else if (avgOrder >= Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange) * -1;
    } else if (side === "SHORT") {
        if (avgOrder < Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange) * -1;
        else if (avgOrder >= Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange);
    }

    //tradeResults.json fill
    let _date = Number(new Date().valueOf());
    exportTradeResult(symbol, _date, leverage, Number((actualPriceChange / leverage).toFixed(4)));

    global._chunk.forEach((chunk, index) => {
        if (chunk.symbol == symbol) {
            sumOfUsedChunks += chunk.chunk[0] * trade_levels.length;
            indexOfChunk = index;
        }
    });

    sumOfUsedChunksAfter += (sumOfUsedChunks * actualPriceChange);

    changeBankBalance(sumOfUsedChunksAfter, symbol);
    updateCoinBankAccount(symbol, sumOfUsedChunksAfter);
    takeChunk(symbol, indexOfChunk);

    return sumOfUsedChunksAfter;
}

export function getBankAccountsStatement() {
    let total: number = 0;
    let totalMargin: number;
    let bankDifference: any = "";
    let defaultBankAmount = 12 * config.defaultBankAccount;

    let _arr = [];

    global._banks.forEach((bank) => {
        _arr.push({
            "symbol": `${bank.ticker.first}${bank.ticker.last}`,
            "collFree": Number(bank.account.toFixed(2))
        });
    });

    global._chunk.forEach((chunk, index) => {
        _arr[index]["collTrade"] = Number(chunk.chunk.reduce((partialSum, a) => partialSum + a, 0).toFixed(2))
    });

    global.banks.get('banks').value().forEach((bank) => {
        total += bank.account;
    });

    totalMargin = total - defaultBankAmount;

    if (totalMargin > 0) {
        bankDifference = Number((((total / defaultBankAmount) - 1) * 100).toFixed(2));
    } else if (totalMargin == 0) {
        bankDifference = 0;
    } else if (totalMargin < 0) {
        bankDifference = Number((((defaultBankAmount / total) - 1) * 100).toFixed(2));
    }

    _arr.push({
        "Total bank": total.toFixed(2),
        "Margin": totalMargin.toFixed(2),
        "Bank percentage": bankDifference
    })

    return _arr;
}

export function getBankLocalAccount(symbol: string) {
    let str = "<i>Bank Statement</i>\n\n";
    symbol += "USDT";

    global._banks.forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase())
            str += `<i>Trading pair</i>: <code>${bank.ticker.first}</code> <b>:</b> <code>${bank.ticker.last}</code>\n\n========\n<i>Unused collateral</i>: \$<i>${bank.account.toFixed(2)}</i>\n`
    });

    global._chunk.forEach((chunk) => {
        if (chunk.symbol === symbol.toUpperCase())
            str += `\n========\n<i>Currently used collateral</i>: \$<i>${chunk.chunk.reduce((partialSum, a) => partialSum + a, 0).toFixed(2)}</i>`
    });

    let db = getDatabase(symbol.toUpperCase(), 'trades/tickers');
    if (db.get('activeTrade').value().trade_levels.length > 0)
        str += "\n\nThere is an active trade!"
    else
        str += "\n\nThere is no active trade at the moment...";

    return str;
}