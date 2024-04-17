Object.defineProperty(exports, "__esModule", { value: true });
exports.binanceAPI = void 0;
const core_1 = require("./core");
class binanceAPI {
    static async placeMarketOrder(symbol, side, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "MARKET",
            quantity: quantity
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/order', 'POST');
        return response;
    }
    static async placeLimitOrder(symbol, side, price, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "LIMIT",
            price: price,
            quantity: quantity
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/order', 'POST');
        return response;
    }
    static async getOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/order', 'GET');
        return response;
    }
    static async deleteOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/order', 'DELETE');
        return response;
    }
    static async cancelAllOpenOrders(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/allOpenOrders', 'DELETE');
        return response;
    }
    static async getOpenOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/openOrder', 'GET');
        return response;
    }
    static async getAllOpenedOrders(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/openOrders', 'GET');
        return response;
    }
    static async getAllOrders(symbol, orderId, limit) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId,
            limit: limit
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/allOrders', 'GET');
        return response;
    }
    static async getFuturesBalance() {
        let _arr = [];
        let response = await (0, core_1.privateRequest)({}, '/fapi/v2/balance', 'GET');
        response.forEach((account) => {
            if (account.asset === "BUSD" || account.asset === "USDT")
                _arr.push(account);
        });
        return _arr;
    }
    static async getAccountInformation() {
        let response = await (0, core_1.privateRequest)({}, '/fapi/v2/account', 'GET');
        return response;
    }
    static async changeTickerLeverage(symbol, leverage) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            leverage: leverage
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/leverage', 'POST');
        return response;
    }
    static async changeMarginType(symbol, marginType) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            marginType: marginType
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/marginType', 'POST');
        return response;
    }
    static async modifyPositionMargin(symbol, amount, type) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            positionSide: "BOTH",
            amount: amount,
            type: type,
        };
        const response = await (0, core_1.privateRequest)(data, '/fapi/v1/positionMargin', 'POST');
        return response;
    }
    static async getPositionInformation(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol
        };
        const response = await (0, core_1.privateRequest)(data, '/fapi/v2/positionRisk', 'GET');
        return response;
    }
    static async getUserTrades(symbol, startTime, endTime, fromId, limit) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol,
            startTime,
            endTime,
            fromId,
            limit
        };
        const response = await (0, core_1.privateRequest)(data, '/fapi/v1/userTrades', 'GET');
        return response;
    }
    static async getIncomeHistory(symbol, startTime, endTime, limit) {
        if (symbol)
            symbol = symbol.toUpperCase();
        const data = {
            symbol,
            startTime,
            endTime,
            limit
        };
        const response = await (0, core_1.privateRequest)(data, '/fapi/v1/income', 'GET');
        return response;
    }
    static async getComissionRates(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        const response = await (0, core_1.privateRequest)(data, '/fapi/v1/comissionRate', 'GET');
        return response;
    }
}
exports.binanceAPI = binanceAPI;
//# sourceMappingURL=binance.js.map