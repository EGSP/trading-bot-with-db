const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {getDatabase} = require("./build/trading-core/src/databaseOperator");

function main() {
    let adapter = new FileSync('./data/tradingTickers.json');
    let DB = low(adapter);

    DB.get('symbols').value().forEach((symbol) => {
        let _db = getDatabase(symbol.value.replace('PERP', ''), 'trades/tickers');
        _db.get('activeTrade').__wrapped__.activeTrade = {}
        _db.write();
    });
}

main();