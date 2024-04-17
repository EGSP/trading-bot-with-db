Object.defineProperty(exports, "__esModule", { value: true });
exports.getBankLocalAccount = exports.getBankAccountsStatement = exports.calculateBankAfterTrade = exports.getChunkToSymbol = exports.takeChunk = exports.takeAllChunks = exports.initCoinBanks = void 0;
const bank_1 = require("./models/banks/virtual/bank");
const ticker_1 = require("./models/tickers/ticker");
const functions_1 = require("./functions/banks/functions");
const databaseOperator_1 = require("../databaseOperator");
const config = require("../../config");
function initCoinBanks() {
    let _arr = [];
    global.banks.get('banks').value().forEach((bank) => {
        const ticker = new ticker_1.Ticker(bank.ticker.first, bank.ticker.last);
        let _bank = new bank_1.Bank(ticker, bank.account);
        _arr.push(_bank);
    });
    return _arr;
}
exports.initCoinBanks = initCoinBanks;
function updateCoinBankAccount(symbol, amount) {
    global._banks.forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase()) {
            bank.account += amount;
        }
    });
}
function takeAllChunks() {
    global._banks.forEach((bank) => {
        let _chunk = (0, functions_1.getMargin)(bank, 3, 33, 12);
        if (!_chunk)
            return;
        (0, functions_1.doWithdrawChunks)(bank, _chunk);
        global._chunk.push({
            chunk: _chunk,
            symbol: `${bank.ticker.first}${bank.ticker.last}`
        });
    });
}
exports.takeAllChunks = takeAllChunks;
function takeChunk(symbol, index) {
    global.banks.get('banks').value().forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase()) {
            let _bank = new bank_1.Bank(new ticker_1.Ticker(bank.ticker.first, bank.ticker.last), bank.account);
            let _chunk = (0, functions_1.getMargin)(_bank, 3, 33, 12);
            if (!_chunk)
                return;
            global._chunk[index] = {
                chunk: _chunk,
                symbol: `${bank.ticker.first}${bank.ticker.last}`
            };
        }
    });
}
exports.takeChunk = takeChunk;
function getChunkToSymbol(symbol, index) {
    let amount = 0;
    global._chunk.forEach((chunk) => {
        if (chunk.symbol === symbol.toUpperCase())
            amount = chunk.chunk[index];
    });
    return amount;
}
exports.getChunkToSymbol = getChunkToSymbol;
function calculateBankAfterTrade(trade_levels, exit_price, leverage, symbol, side) {
    let _arr = [];
    let sumOfUsedChunks = 0;
    let sumOfUsedChunksAfter = 0;
    let indexOfChunk;
    symbol = symbol.toUpperCase();
    trade_levels.forEach((trade_level) => {
        _arr.push(Number(trade_level));
    });
    let avgOrder = Number((_arr.reduce((partialSum, a) => partialSum + a, 0) / _arr.length).toFixed(4));
    let actualPriceChange = (((1 - (avgOrder / Number(exit_price)))) * leverage);
    if (side === "LONG") {
        if (avgOrder < Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange);
        else if (avgOrder >= Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange) * -1;
    }
    else if (side === "SHORT") {
        if (avgOrder < Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange) * -1;
        else if (avgOrder >= Number(exit_price))
            actualPriceChange = Math.abs(actualPriceChange);
    }
    let _date = Number(new Date().valueOf());
    (0, databaseOperator_1.exportTradeResult)(symbol, _date, leverage, Number((actualPriceChange / leverage).toFixed(4)));
    global._chunk.forEach((chunk, index) => {
        if (chunk.symbol == symbol) {
            sumOfUsedChunks += chunk.chunk[0] * trade_levels.length;
            indexOfChunk = index;
        }
    });
    sumOfUsedChunksAfter += (sumOfUsedChunks * actualPriceChange);
    (0, databaseOperator_1.changeBankBalance)(sumOfUsedChunksAfter, symbol);
    updateCoinBankAccount(symbol, sumOfUsedChunksAfter);
    takeChunk(symbol, indexOfChunk);
    return sumOfUsedChunksAfter;
}
exports.calculateBankAfterTrade = calculateBankAfterTrade;
function getBankAccountsStatement() {
    let total = 0;
    let totalMargin;
    let bankDifference = "";
    let defaultBankAmount = 12 * config.defaultBankAccount;
    let _arr = [];
    global._banks.forEach((bank) => {
        _arr.push({
            "symbol": `${bank.ticker.first}${bank.ticker.last}`,
            "collFree": Number(bank.account.toFixed(2))
        });
    });
    global._chunk.forEach((chunk, index) => {
        _arr[index]["collTrade"] = Number(chunk.chunk.reduce((partialSum, a) => partialSum + a, 0).toFixed(2));
    });
    global.banks.get('banks').value().forEach((bank) => {
        total += bank.account;
    });
    totalMargin = total - defaultBankAmount;
    if (totalMargin > 0) {
        bankDifference = Number((((total / defaultBankAmount) - 1) * 100).toFixed(2));
    }
    else if (totalMargin == 0) {
        bankDifference = 0;
    }
    else if (totalMargin < 0) {
        bankDifference = Number((((defaultBankAmount / total) - 1) * 100).toFixed(2));
    }
    _arr.push({
        "Total bank": total.toFixed(2),
        "Margin": totalMargin.toFixed(2),
        "Bank percentage": bankDifference
    });
    return _arr;
}
exports.getBankAccountsStatement = getBankAccountsStatement;
function getBankLocalAccount(symbol) {
    let str = "<i>Bank Statement</i>\n\n";
    symbol += "USDT";
    global._banks.forEach((bank) => {
        if (`${bank.ticker.first}${bank.ticker.last}` === symbol.toUpperCase())
            str += `<i>Trading pair</i>: <code>${bank.ticker.first}</code> <b>:</b> <code>${bank.ticker.last}</code>\n\n========\n<i>Unused collateral</i>: \$<i>${bank.account.toFixed(2)}</i>\n`;
    });
    global._chunk.forEach((chunk) => {
        if (chunk.symbol === symbol.toUpperCase())
            str += `\n========\n<i>Currently used collateral</i>: \$<i>${chunk.chunk.reduce((partialSum, a) => partialSum + a, 0).toFixed(2)}</i>`;
    });
    let db = (0, databaseOperator_1.getDatabase)(symbol.toUpperCase(), 'trades/tickers');
    if (db.get('activeTrade').value().trade_levels.length > 0)
        str += "\n\nThere is an active trade!";
    else
        str += "\n\nThere is no active trade at the moment...";
    return str;
}
exports.getBankLocalAccount = getBankLocalAccount;
//# sourceMappingURL=bankingModule.js.map