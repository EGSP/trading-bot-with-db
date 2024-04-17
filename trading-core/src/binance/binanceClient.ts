import * as crypto from "crypto";
import axios from "axios";
import qs = require('qs');

export class BinanceClient {
    readonly apiKey : string = undefined;
    readonly apiSecret : string = undefined;
    readonly endPoint : string = undefined;
    constructor(apiKey : string, apiSecret : string, endPoint : string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.endPoint = endPoint;
    }
    encode (requestData : any) : string {
        return crypto.createHmac('sha256', this.apiSecret).update(requestData).digest('hex');
    }

    async request (data, request, type) {
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
            const response = await axios(requestConfig).then(r => r.data);
            return response;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    }

    /**
     * Places a market order
     * @param symbol - Ticker name
     * @param side - Should be either SELL or BUY
     * @param quantity - Amount of coins you want to buy
     */
    async placeMarketOrder(symbol : string, side : string, quantity : number)
    {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();

        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "MARKET",
            quantity: quantity
        }

        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }

    async placeCloseMarketOrder(symbol : string, side : string, quantity : number)
    {
        symbol = symbol.toUpperCase();
        side = side.toUpperCase();

        const data = {
            symbol: symbol,
            side: side,
            positionSide: "BOTH",
            type: "MARKET",
            quantity: quantity,
            reduceOnly: true
        }

        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }

    /**
     * Places new LIMIT order
     * @param symbol - Ticker name
     * @param side - Should be either SELL or BUY
     * @param price
     * @param quantity
     */
     async placeLimitOrder(symbol : string, side : string, price : number, quantity : number) {
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
        }

        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }

    async placeStopLimit(symbol : string, side : string, price : number, quantity : number) {
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
        }

        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }

    async placeTakeProfitLimit(symbol : string, side : string, price : number, quantity : number) {
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
        }

        let response = await this.request(data, '/fapi/v1/order', 'POST');
        return response;
    }

    /**
     * Returns full information about a certain order.
     * @param symbol - Ticker name
     * @param orderId
     */
     async getOrder(symbol : string, orderId : number) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            orderId: orderId
        }

        let response = await this.request(data, '/fapi/v1/order', 'GET');
        return response;
    }

    /**
     * Deletes the order
     * @param symbol - Ticker name
     * @param orderId
     */
     async deleteOrder(symbol : string, orderId: number) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            orderId: orderId
        }

        let response = await this.request(data, '/fapi/v1/order', 'DELETE');
        return response;
    }

    /**
     * Cancells all currently opened, unfilled orders.
     * @param symbol - Ticker name
     */
     async cancelAllOpenOrders(symbol : string) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol
        }

        let response = await this.request(data, '/fapi/v1/allOpenOrders', 'DELETE');
        return response;
    }

    /**
     * Returns information about currently opened, but not filled order.
     * @param symbol - Ticker name
     * @param orderId
     */
     async getOpenOrder(symbol : string, orderId : number) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            orderId: orderId
        }

        let response = await this.request(data, '/fapi/v1/openOrder', 'GET');
        return response;
    }

    /**
     * Returns list of all currently opened orders
     * @param symbol - Ticker name
     */
     async getAllOpenedOrders(symbol : string) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol
        }

        let response = await this.request(data, '/fapi/v1/openOrders', 'GET');
        return response;
    }

    /**
     * @param symbol - Ticker name
     * @param orderId - If orderId is set, it will get orders >= that orderId. Otherwise most recent orders are returned.
     * @param limit - Default 500; max 1000. Limits the amount of returnable orders.
     *
     * @returns Promise<Array<any> - array filled with trades that fit the selection
     */
     async getAllOrders(symbol : string, orderId : number, limit : number) : Promise<Array<any>> {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            orderId: orderId,
            limit: limit
        }

        let response = await this.request(data, '/fapi/v1/allOrders', 'GET');
        return response;
    }

    /**
     * Returns BUSD and USDT balances that are currently on futures account.
     */
     async getFuturesBalance() : Promise<Array<any>> {
        let _arr = [];
        let response = await this.request({}, '/fapi/v2/balance', 'GET');

        response.forEach((account) => {
            if(account.asset === "BUSD" || account.asset === "USDT")
                _arr.push(account);
        })

        return _arr;
    }

    /**
     * Get full user's futures account
     */
     async getAccountInformation() : Promise<any> {
        let response = await this.request({}, '/fapi/v2/account', 'GET');
        return response;
    }

    /**
     * Changes leverage for certain ticker
     * @param symbol - Ticker name
     * @param leverage - Integer from 1 to 125
     * @returns Object that contains currently set leverage, maxNotionalValue and symbol
     */
     async changeTickerLeverage(symbol : string, leverage : number) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            leverage: leverage
        }

        let response = await this.request(data, '/fapi/v1/leverage', 'POST');
        return response;
    }

    /**
     * Changes margin type for certain ticker
     * @param symbol - Ticker name
     * @param marginType - Should be either CROSSED or ISOLATED
     * @returns Message that contains code and short msg
     */
     async changeMarginType(symbol : string, marginType : string) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            marginType: marginType
        }

        let response = await this.request(data, '/fapi/v1/marginType', 'POST');
        return response;
    }

    /**
     * Adds or removes margin from position. Can ONLY be used for ISOLATED mode.
     * @param symbol - Ticker name
     * @param amount - Amount of USD used
     * @param type - 1: Add margin, 2: Reduce margin
     *
     * @returns Promise<any>
     */
     async modifyPositionMargin(symbol : string, amount : number, type : number) : Promise<any> {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol,
            positionSide: "BOTH",
            amount: amount,
            type: type,
        }

        const response = await this.request(data, '/fapi/v1/positionMargin', 'POST');
        return response;
    }

    /**
     * Returns information about currently opened position on certain ticker.
     * @param symbol - Ticker name
     */
     async getPositionInformation(symbol : string) : Promise<any> {
        symbol = symbol.toUpperCase();

        const data = {
            symbol
        }

        const response = await this.request(data, '/fapi/v2/positionRisk', 'GET');
        return response;
    }

    /**
     * Get trades for a specific account and symbol. Time is sent in UNIX timestamp format.
     * @param symbol - Ticker name
     * @param startTime
     * @param endTime
     * @param fromId - Trade id to fetch from. Default gets most recent trades.
     * @param limit - Default: 500, max: 1000.
     */
     async getUserTrades(symbol : string, startTime : number | undefined, endTime : number | undefined,
                               fromId : number | undefined, limit : number | undefined) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol,
            startTime,
            endTime,
            fromId,
            limit
        }

        const response = await this.request(data, '/fapi/v1/userTrades', 'GET');
        return response;
    }

    /**
     * Returns full amount of completed transactions including fees, incomeType etc...
     * @param symbol - Ticker name
     * @param startTime
     * @param endTime
     * @param limit - Default: 500, max: 1000.
     */
     async getIncomeHistory(symbol : string | undefined, startTime : number | undefined,
                                  endTime : number | undefined, limit : number | undefined) {
        if(symbol)
            symbol = symbol.toUpperCase();

        let data = {
            symbol,
            startTime,
            endTime,
            limit
        }

        const response = await this.request(data, '/fapi/v1/income', 'GET');
        return response;
    }

    /**
     * Returns comission rate for certain ticker
     * @param symbol - Ticker name
     */
     async getComissionRates(symbol : string) {
        symbol = symbol.toUpperCase();

        const data = {
            symbol: symbol
        }

        const response = await this.request(data, '/fapi/v1/comissionRate', 'GET');
        return response;
    }
}