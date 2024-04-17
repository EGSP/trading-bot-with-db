var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceClient = void 0;
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const qs = require("qs");
class BinanceClient {
    constructor(apiKey, apiSecret, endPoint) {
        this.apiKey = undefined;
        this.apiSecret = undefined;
        this.endPoint = undefined;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.endPoint = endPoint;
    }
    encode(requestData) {
        return crypto.createHmac('sha256', this.apiSecret).update(requestData).digest('hex');
    }
    async request(data, request, type) {
        data.timestamp = Date.now();
        const dataQueryString = qs.stringify(data);
        const signature = this.encode(dataQueryString);
        const requestConfig = {
            method: type,
            url: this.endPoint + request + '?' + dataQueryString + '&signature=' + signature,
            headers: {
                'X-MBX-APIKEY': this.apiKey
            }
        };
        try {
            const response = await (0, axios_1.default)(requestConfig).then(r => r.data);
            return response;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    }
    async placeMarketOrder(symbol, side, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "MARKET",
            quantity: quantity
        };
        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }
    async placeCloseMarketOrder(symbol, side, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "MARKET",
            quantity: quantity,
            reduceOnly: true
        };
        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }
    async placeLimitOrder(symbol, side, price, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "LIMIT",
            price: price,
            quantity: quantity,
            timeInForce: "GTC"
        };
        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }
    async placeStopLimit(symbol, side, price, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "STOP",
            price: price,
            stopPrice: price,
            quantity: quantity
        };
        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }
    async placeTakeProfitLimit(symbol, side, price, quantity) {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();
        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "TAKE_PROFIT",
            price: price,
            stopPrice: price,
            quantity: quantity
        };
        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }
    async getOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await this.request(data, '/fapi/v1/order', 'GET');
        return response;
    }
    async deleteOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await this.request(data, '/fapi/v1/order', 'DELETE');
        return response;
    }
    async cancelAllOpenOrders(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        let response = await this.request(data, '/fapi/v1/allOpenOrders', 'DELETE');
        return response;
    }
    async getOpenOrder(symbol, orderId) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId
        };
        let response = await this.request(data, '/fapi/v1/openOrder', 'GET');
        return response;
    }
    async getAllOpenedOrders(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        let response = await this.request(data, '/fapi/v1/openOrders', 'GET');
        return response;
    }
    async getAllOrders(symbol, orderId, limit) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            orderId: orderId,
            limit: limit
        };
        let response = await this.request(data, '/fapi/v1/allOrders', 'GET');
        return response;
    }
    async getFuturesBalance() {
        let _arr = [];
        let response = await this.request({}, '/fapi/v2/balance', 'GET');
        response.forEach((account) => {
            if (account.asset === "BUSD" || account.asset === "USDT")
                _arr.push(account);
        });
        return _arr;
    }
    async getAccountInformation() {
        let response = await this.request({}, '/fapi/v2/account', 'GET');
        return response;
    }
    async changeTickerLeverage(symbol, leverage) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            leverage: leverage
        };
        let response = await this.request(data, '/fapi/v1/leverage', 'POST');
        return response;
    }
    async changeMarginType(symbol, marginType) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            marginType: marginType
        };
        let response = await this.request(data, '/fapi/v1/marginType', 'POST');
        return response;
    }
    async modifyPositionMargin(symbol, amount, type) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol,
            positionSide: "BOTH",
            amount: amount,
            type: type,
        };
        const response = await this.request(data, '/fapi/v1/positionMargin', 'POST');
        return response;
    }
    async getPositionInformation(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol
        };
        const response = await this.request(data, '/fapi/v2/positionRisk', 'GET');
        return response;
    }
    async getUserTrades(symbol, startTime, endTime, fromId, limit) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol,
            startTime,
            endTime,
            fromId,
            limit
        };
        const response = await this.request(data, '/fapi/v1/userTrades', 'GET');
        return response;
    }
    async getIncomeHistory(symbol, startTime, endTime, limit) {
        if (symbol)
            symbol = symbol.toUpperCase();
        let data = {
            symbol,
            startTime,
            endTime,
            limit
        };
        const response = await this.request(data, '/fapi/v1/income', 'GET');
        return response;
    }
    async getComissionRates(symbol) {
        symbol = symbol.toUpperCase();
        const data = {
            symbol: symbol
        };
        const response = await this.request(data, '/fapi/v1/comissionRate', 'GET');
        return response;
    }
}
exports.BinanceClient = BinanceClient;
//# sourceMappingURL=binanceClient.js.map