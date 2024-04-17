var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradingSetState = exports.getActiveTrades = exports.exportTradeResult = exports.getCumulativePNL = exports.changeBankBalance = exports.saveTransaction = exports.changeLast = exports.pushLast = exports.pushObject = exports.getLast = exports.getList = exports.getDatabase = exports.getPositionQuantity = exports.positionChange = exports.archivePosition = exports.getActivePosition = exports.getLastPositionId = exports.getTickerInfo = exports.getAllTickers = void 0;
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const transactionType_1 = require("./models/transactionType");
const transaction_1 = require("./models/transaction");
function getAllTickers() {
    let _tickers = [];
    global.db.read();
    global.db.get("symbols").value().forEach(function (ticker) {
        _tickers.push(ticker.value);
        ticker.value = ticker.value.replace('PERP', '');
    });
    return _tickers;
}
exports.getAllTickers = getAllTickers;
function getTickerInfo(ticker) {
    let _tickerinfo;
    global.db.get("symbols").value().forEach(function (_ticker) {
        if (_ticker.value.indexOf('PERP') == -1)
            _ticker.value += "PERP";
        if (_ticker.value == `${ticker.toUpperCase()}PERP`)
            _tickerinfo = _ticker;
    });
    return _tickerinfo;
}
exports.getTickerInfo = getTickerInfo;
function getLastPositionId(ticker) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    let lastTrade = getLast(db, 'trades');
    if (!lastTrade)
        return 1;
    else
        return lastTrade.id;
}
exports.getLastPositionId = getLastPositionId;
function getActivePosition(ticker) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    if (Object.keys(db.get().__wrapped__).length === 0) {
        db.get().__wrapped__.trades = [];
        db.get().__wrapped__.activeTrade = {};
        db.write();
    }
    let position = db.get('activeTrade').value();
    if (Object.keys(position).length === 0)
        return { "is_active": false };
    else
        return position;
}
exports.getActivePosition = getActivePosition;
function archivePosition(ticker) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    let position = db.get('activeTrade').value();
    pushLast(db, 'trades', position);
}
exports.archivePosition = archivePosition;
function positionChange(ticker, param, value) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    db.set(`activeTrade.${param}`, value).write();
}
exports.positionChange = positionChange;
function getPositionQuantity(ticker) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    return db.get('activeTrade').value();
}
exports.getPositionQuantity = getPositionQuantity;
function createDatabase(name, catalog) {
    let adapter;
    let path;
    if (catalog) {
        path = `data/${catalog}/${name}.json`;
        if (!fs.existsSync(`data/${catalog}/`))
            fs.mkdirSync(`data/${catalog}`, { recursive: true });
    }
    else
        path = `data/${name}.json`;
    try {
        adapter = new FileSync(path);
    }
    catch (error) {
        fs.appendFile(path, '\{\}', function (err) {
            if (err)
                throw err;
        });
        adapter = new FileSync(path);
    }
    return adapter;
}
function getDatabase(name, catalog) {
    let adapter;
    let path = `data/${catalog}/${name}.json`;
    let _database;
    adapter = new FileSync(path);
    try {
        _database = low(adapter);
    }
    catch (err) {
        adapter = createDatabase(name, catalog);
    }
    return _database;
}
exports.getDatabase = getDatabase;
function getList(database, listName) {
    let _arr = database.get(listName).value();
    if (!_arr) {
        database.read();
        database.get().__wrapped__[`${listName}`] = [];
        database.write();
    }
    return database.get(listName).value();
}
exports.getList = getList;
function getLast(database, listName) {
    let _arr = database.get(listName).value();
    if (_arr)
        return _arr[_arr.length - 1];
    else
        return undefined;
}
exports.getLast = getLast;
function pushObject(database, listName, obj) {
    database.get(listName).push(obj).write();
}
exports.pushObject = pushObject;
function pushLast(database, listName, obj) {
    let _arr = database.get(listName).value();
    if (!_arr) {
        database.read();
        database.get().__wrapped__[`${listName}`] = [];
        database.write();
    }
    database.get(listName).push(obj).write();
}
exports.pushLast = pushLast;
function changeLast(database, listName, obj) {
    let _arr = database.get(listName).value();
    if (!_arr)
        pushLast(database, listName, obj);
    else if (_arr)
        if (_arr.length === 0)
            pushLast(database, listName, obj);
    if (_arr) {
        if (_arr.length > 0) {
            let _temp = database.get(listName).value();
            _temp.splice(_temp.length - 1, 1);
            database.write();
            pushLast(database, listName, obj);
        }
    }
}
exports.changeLast = changeLast;
function saveTransaction(ticker, transactiontype, amount) {
    let db = getDatabase(ticker.toUpperCase(), 'bank/transactions');
    let lastPosition = getLast(db, 'transactions');
    let currentTime = new Date().valueOf();
    transactiontype = transactiontype.toUpperCase() === "deposit" ? transactionType_1.transactionType.deposit : transactionType_1.transactionType.withdraw;
    if (lastPosition) {
        let _id = lastPosition.ID.split('.');
        pushLast(db, 'transactions', new transaction_1.Transaction(ticker.toUpperCase(), transactiontype, amount, `${Number(_id[0]) + 1}.${currentTime}`));
    }
    else
        pushLast(db, 'transactions', new transaction_1.Transaction(ticker.toUpperCase(), transactiontype, amount, `1.${currentTime}`));
}
exports.saveTransaction = saveTransaction;
function changeBankBalance(number, symbol) {
    global.banks.get('banks').value().forEach((bank) => {
        if (bank.ticker.first === symbol.replace('USDT', '').toUpperCase()) {
            bank.account += number;
            bank.account = Number(bank.account.toFixed(2));
        }
        global.banks.write();
    });
}
exports.changeBankBalance = changeBankBalance;
function getCumulativePNL(data) {
    data = data.split(' ');
    let ticker;
    let date;
    if (data.length === 1) {
        ticker = undefined;
        date = data[0];
    }
    else {
        ticker = data[0] + "USDT";
        date = data[1];
    }
    date = date.split('.');
    date.forEach((str, index) => {
        if (str.length === 1) {
            date[index] = `0${str}`;
        }
    });
    let startTime = new Date(`${date[2]}-${date[1]}-${date[0]}T00:00:00`).valueOf();
    let endTime = startTime + 86400000;
    if (ticker) {
        let pnl = 0;
        let db = getDatabase(ticker, 'trades/tickers');
        db.get('trades').value().forEach((trade) => {
            if (Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) >= startTime && Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) <= endTime)
                pnl += Number(trade.extra_params.realized_profit);
        });
        return pnl.toFixed(2);
    }
    else {
        let pnl = 0;
        global.db.get('symbols').value().forEach((symbol) => {
            let db = getDatabase(symbol.value.replace('PERP', ''), 'trades/tickers');
            db.get('trades').value().forEach((trade) => {
                if (Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) >= startTime && Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) <= endTime)
                    pnl += Number(trade.extra_params.realized_profit);
            });
        });
        return pnl.toFixed(2);
    }
}
exports.getCumulativePNL = getCumulativePNL;
function exportTradeResult(symbol, timestamp, leverage, result) {
    global.tradeResults.get('trades').push({
        "ticker": symbol,
        "timestamp": timestamp,
        "leverage": leverage,
        "result": result
    }).write();
}
exports.exportTradeResult = exportTradeResult;
async function getActiveTrades() {
    var _a, e_1, _b, _c;
    let activepairs = global.db.get('symbols').value();
    let _arr = [];
    try {
        for (var _d = true, activepairs_1 = __asyncValues(activepairs), activepairs_1_1; activepairs_1_1 = await activepairs_1.next(), _a = activepairs_1_1.done, !_a;) {
            _c = activepairs_1_1.value;
            _d = false;
            try {
                let pair = _c;
                let db = getDatabase(pair.value.replace('PERP', ''), 'trades/tickers');
                let _obj = {
                    activetrade_local: undefined,
                    activetrade_binance: undefined
                };
                let activetrade = db.get('activeTrade').value();
                if (Object.keys(activetrade).length > 0)
                    if (activetrade.trade_levels.length > 0)
                        _obj.activetrade_local = activetrade;
                let res = await global.binanceClient.getPositionInformation(pair.value.replace('PERP', '')).then(r => r[0]);
                if (Number(res.positionAmt) > 0)
                    _obj.activetrade_binance = res;
                if (_obj.activetrade_binance || _obj.activetrade_local)
                    _arr.push(_obj);
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = activepairs_1.return)) await _b.call(activepairs_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return _arr;
}
exports.getActiveTrades = getActiveTrades;
function tradingSetState(value) {
    global.userDB.get('user').set("trading_active", value).write();
}
exports.tradingSetState = tradingSetState;
//# sourceMappingURL=databaseOperator.js.map