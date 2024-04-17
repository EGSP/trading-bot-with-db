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
            quantity: quantity,
            timestamp: Date.now()
        };
        let response = await (0, core_1.privateRequest)(data, '/fapi/v1/order', 'POST');
        return response;
    }
}
exports.binanceAPI = binanceAPI;
//# sourceMappingURL=binanceEndPoint.js.map