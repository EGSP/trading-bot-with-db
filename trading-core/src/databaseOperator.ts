import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
import fs = require('fs');
import {transactionType} from "./models/transactionType";
import {Transaction} from "./models/transaction";

export function getAllTickers() {
    let _tickers: any[] = [];

    global.db.read();

    global.db.get("symbols").value().forEach(function (ticker) {
        _tickers.push(ticker.value);
        ticker.value = ticker.value.replace('PERP', '');
    });

    return _tickers;
}

export function getTickerInfo(ticker: string) {
    let _tickerinfo;

    global.db.get("symbols").value().forEach(function (_ticker) {
        if (_ticker.value.indexOf('PERP') == -1)
            _ticker.value += "PERP";

        if (_ticker.value == `${ticker.toUpperCase()}PERP`)
            _tickerinfo = _ticker;
    });
    return _tickerinfo;
}

export function getLastPositionId(ticker: string) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    let lastTrade = getLast(db, 'trades');

    if (!lastTrade)
        return 1;
    else
        return lastTrade.id;
}

export function getActivePosition(ticker: string) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    if (Object.keys(db.get().__wrapped__).length === 0) {
        db.get().__wrapped__.trades = [];
        db.get().__wrapped__.activeTrade = {}
        db.write();
    }

    let position = db.get('activeTrade').value();

    if (Object.keys(position).length === 0)
        return {"is_active": false}
    else
        return position;
}

export function archivePosition(ticker: string) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    let position = db.get('activeTrade').value();
    pushLast(db, 'trades', position);
}

export function positionChange(ticker: string, param: any, value: any) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    db.set(`activeTrade.${param}`, value).write();
}

export function getPositionQuantity(ticker: string) {
    let db = getDatabase(ticker.toUpperCase(), 'trades/tickers');
    return db.get('activeTrade').value();
}

function createDatabase(name: string, catalog: string | undefined) {
    let adapter;
    let path;

    if (catalog) {
        path = `data/${catalog}/${name}.json`;
        if (!fs.existsSync(`data/${catalog}/`))
            fs.mkdirSync(`data/${catalog}`, {recursive: true});
    } else
        path = `data/${name}.json`;

    try {
        adapter = new FileSync(path);
    } catch (error) {
        fs.appendFile(path, '\{\}', function (err) {
            if (err) throw err;
        });
        adapter = new FileSync(path);
    }

    return adapter;
}

export function getDatabase(name: string, catalog: string | undefined) {
    let adapter;
    let path = `data/${catalog}/${name}.json`;
    let _database;

    adapter = new FileSync(path);

    try {
        _database = low(adapter);
    } catch (err) {
        adapter = createDatabase(name, catalog);
    }

    return _database;
}

export function getList(database, listName: string) {
    let _arr = database.get(listName).value();

    if (!_arr) {
        database.read();
        database.get().__wrapped__[`${listName}`] = [];
        database.write();
    }

    return database.get(listName).value();
}

export function getLast(database, listName: string) {
    let _arr = database.get(listName).value();
    if (_arr)
        return _arr[_arr.length - 1];
    else
        return undefined;
}

export function pushObject(database, listName: string, obj) {
    database.get(listName).push(obj).write();
}

export function pushLast(database, listName: string, obj) {
    let _arr = database.get(listName).value();

    if (!_arr) {
        database.read();
        database.get().__wrapped__[`${listName}`] = [];
        database.write();
    }

    database.get(listName).push(obj).write();
}

export function changeLast(database, listName: string, obj) {
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

export function saveTransaction(ticker: string, transactiontype: any, amount: number) {
    let db = getDatabase(ticker.toUpperCase(), 'bank/transactions');
    let lastPosition = getLast(db, 'transactions');

    let currentTime = new Date().valueOf();
    transactiontype = transactiontype.toUpperCase() === "deposit" ? transactionType.deposit : transactionType.withdraw;

    if (lastPosition) {
        let _id = lastPosition.ID.split('.');
        pushLast(db, 'transactions', new Transaction(ticker.toUpperCase(), transactiontype, amount, `${Number(_id[0]) + 1}.${currentTime}`));
    } else
        pushLast(db, 'transactions', new Transaction(ticker.toUpperCase(), transactiontype, amount, `1.${currentTime}`));
}

export function changeBankBalance(number: number, symbol: string) {
    global.banks.get('banks').value().forEach((bank) => {
        if (bank.ticker.first === symbol.replace('USDT', '').toUpperCase()) {
            bank.account += number;
            bank.account = Number(bank.account.toFixed(2));
        }
        global.banks.write();
    });
}

export function getCumulativePNL(data) {
    data = data.split(' ');
    let ticker;
    let date;

    if(data.length === 1) {
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
            date[index] = `0${str}`
        }
    });

    let startTime = new Date(`${date[2]}-${date[1]}-${date[0]}T00:00:00`).valueOf();
    let endTime = startTime + 86400000;

    if (ticker) {
        let pnl: number = 0;
        let db = getDatabase(ticker, 'trades/tickers');
        db.get('trades').value().forEach((trade) => {
            if (Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) >= startTime && Number(trade.trade_levels_time[trade.trade_levels_time.length - 1]) <= endTime)
                pnl += Number(trade.extra_params.realized_profit);
        });
        return pnl.toFixed(2);
    } else {
        let pnl: number = 0;
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

export function exportTradeResult(symbol, timestamp, leverage, result) {
    global.tradeResults.get('trades').push({
        "ticker": symbol,
        "timestamp": timestamp,
        "leverage": leverage,
        "result": result
    }).write();
}

export async function getActiveTrades() {
    let activepairs = global.db.get('symbols').value();
    let _arr = [];

    for await(let pair of activepairs) {
        let db = getDatabase(pair.value.replace('PERP', ''), 'trades/tickers');
        let _obj = {
            activetrade_local: undefined,
            activetrade_binance: undefined
        }

        let activetrade = db.get('activeTrade').value();

        if(Object.keys(activetrade).length > 0)
            if (activetrade.trade_levels.length > 0)
                _obj.activetrade_local = activetrade;

        let res = await global.binanceClient.getPositionInformation(pair.value.replace('PERP', '')).then(r => r[0]);
        if(Number(res.positionAmt) > 0)
            _obj.activetrade_binance = res;

        if(_obj.activetrade_binance || _obj.activetrade_local)
            _arr.push(_obj);
    }

    return _arr;
}

export function tradingSetState(value : boolean) {
    global.userDB.get('user').set("trading_active", value).write();
}