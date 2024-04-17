Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsFromEnd = exports.saveTransaction = exports.getRealBalances = exports.closePosition = exports.placeLimitOrder = exports.binanceMarketOrder = exports.initBinanceClient = exports.calculateQuantity = exports.updateFuturesAccount = exports.executeBankAccounts = void 0;
const databaseOperator_1 = require("../databaseOperator");
const binanceClient_1 = require("./binanceClient");
const config = require("../../config");
const binanceInterface_1 = require("../binanceInterface");
function executeBankAccounts(percentage) {
    let userInstance = global.userDB.get('user').value();
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    userInstance.active_tickers_list.forEach((ticker) => {
        let ifExists = false;
        db.get('banks').value().forEach((account) => {
            if (account.symbol === ticker)
                ifExists = true;
        });
        if (!ifExists)
            db.get('banks').push({ "symbol": ticker, "account": 20 }).write();
    });
    InitializeFuturesAccounts(percentage);
}
exports.executeBankAccounts = executeBankAccounts;
function InitializeFuturesAccounts(percentage) {
    global.futuresBanking = [];
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    db.get('banks').value().forEach((account) => {
        let obj = {
            ticker: account.symbol,
            account: account.account,
            chunks: []
        };
        let _chunkAmount = (obj.account * (percentage / 100));
        obj.chunks = [_chunkAmount];
        global.futuresBanking.push(obj);
    });
}
function updateFuturesAccount(symbol, sum, percentage) {
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    db.get('banks').value().forEach((account) => {
        if (account.symbol === symbol) {
            account.account += sum;
            global.futuresBanking.forEach((bank) => {
                if (bank.ticker === account.symbol) {
                    bank.account = account.account;
                    let _chunkAmount = (account.account * (percentage / 100));
                    bank.chunks = [_chunkAmount];
                }
            });
        }
    });
    db.write();
}
exports.updateFuturesAccount = updateFuturesAccount;
function calculateQuantity(symbol, currentPrice) {
    let ticker;
    let amount;
    global.db.get('symbols').value().forEach((_ticker) => {
        if (_ticker.value === symbol + "PERP") {
            ticker = _ticker;
        }
    });
    global.futuresBanking.forEach((bank) => {
        if (bank.ticker === symbol) {
            amount = bank.chunks[0];
        }
    });
    return Number((amount / currentPrice).toFixed(ticker.precision)) * ticker.leverage;
}
exports.calculateQuantity = calculateQuantity;
function initBinanceClient() {
    global.binanceClient = new binanceClient_1.BinanceClient('E2d6Uz1M7kCOa4TBdQVqXWIOk4ezREqhvA2QcbpT9EepB9skZuWODFEVYQVDWNvh', 'jrb5D09hfQEzhAC0Sz9A0LSiv90RXIXai3w1IXZDtDmz6Wi9t928eXsAM9wtm4yV', "https://fapi.binance.com");
}
exports.initBinanceClient = initBinanceClient;
async function binanceMarketOrder(symbol, side, currentPrice) {
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    let ticker;
    global.db.get('symbols').value().forEach((_ticker) => {
        if (_ticker.value === symbol + "PERP") {
            ticker = _ticker;
        }
    });
    let isIncluded = false;
    let hasBalance = false;
    db.get('banks').value().forEach((account) => {
        if (account.symbol === symbol)
            if (account.account > 0)
                hasBalance = true;
    });
    global.db.get('symbols').value().forEach((_symbol) => {
        if (_symbol.value.replace('PERP', '') === symbol)
            isIncluded = true;
    });
    if (isIncluded && hasBalance) {
        let quantity = calculateQuantity(symbol, currentPrice);
        quantity = Number(Math.abs(Number(quantity)).toFixed(ticker.precision));
        let res = await global.binanceClient.placeMarketOrder(symbol, side, Math.abs(quantity));
        return res;
    }
    return undefined;
}
exports.binanceMarketOrder = binanceMarketOrder;
async function placeLimitOrder(symbol, side, currentPrice) {
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    let ticker;
    global.db.get('symbols').value().forEach((_ticker) => {
        if (_ticker.value === symbol + "PERP") {
            ticker = _ticker;
        }
    });
    let isIncluded = false;
    let hasBalance = false;
    let tradingActive = global.userDB.get('user').value().trading_active;
    db.get('banks').value().forEach((account) => {
        if (account.symbol === symbol)
            if (account.account > 0)
                hasBalance = true;
    });
    global.db.get('symbols').value().forEach((_symbol) => {
        if (_symbol.value.replace('PERP', '') === symbol)
            isIncluded = true;
    });
    if (isIncluded && hasBalance && tradingActive) {
        let quantity = calculateQuantity(symbol, currentPrice);
        quantity = Number(Math.abs(Number(quantity)).toFixed(ticker.precision));
        let trans = await global.binanceClient.placeLimitOrder(symbol, side, currentPrice, quantity);
        let order = await global.binanceClient.getOrder(symbol, trans.orderId);
        if (order.status === "FILLED") {
            await (0, binanceInterface_1.sendLogs)(JSON.stringify(order));
            saveTransaction(symbol, order);
            return trans;
        }
    }
    return undefined;
}
exports.placeLimitOrder = placeLimitOrder;
async function closePosition(symbol, side, quantity) {
    let trans = await global.binanceClient.placeMarketOrder(symbol, side, quantity);
    let order = await global.binanceClient.getOrder(symbol, trans.orderId);
    if (order.status === "FILLED") {
        await (0, binanceInterface_1.sendLogs)(JSON.stringify(order));
        saveTransaction(symbol, order);
        return trans;
    }
    return undefined;
}
exports.closePosition = closePosition;
async function getRealBalances() {
    let db = (0, databaseOperator_1.getDatabase)('futuresBankingSystem', '/bank/');
    let arr = db.get('banks').value();
    let balance = await global.binanceClient.getFuturesBalance();
    return {
        accounts: arr,
        totalBalance: balance,
        defBank: config.defaultBankAccount
    };
}
exports.getRealBalances = getRealBalances;
function saveTransaction(symbol, order) {
    let _db = (0, databaseOperator_1.getDatabase)(symbol, 'trades/transactions');
    if (Object.keys(_db.get().__wrapped__).length === 0) {
        _db.get().__wrapped__.orders = [];
        _db.write();
    }
    (0, databaseOperator_1.pushLast)(_db, 'orders', order);
}
exports.saveTransaction = saveTransaction;
function getTransactionsFromEnd(symbol, amount) {
    let _db = (0, databaseOperator_1.getDatabase)(symbol, 'trades/transactions');
    let orders = _db.get('orders').value();
    let _arr = [];
    for (let i = 1; i < amount + 1; i++)
        _arr.push(orders[orders.length - i]);
    return _arr;
}
exports.getTransactionsFromEnd = getTransactionsFromEnd;
//# sourceMappingURL=util.js.map