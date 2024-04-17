Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeRequest = void 0;
const bankingModule_1 = require("./banking/bankingModule");
const statsModule_1 = require("./statsModule");
const databaseOperator_1 = require("./databaseOperator");
const tradingViewParse_1 = require("./tradingViewParse");
const util_1 = require("./binance/util");
async function decomposeRequest(msg) {
    switch (msg.query) {
        case "get/bank":
            return (0, bankingModule_1.getBankAccountsStatement)();
        case "get/account":
            return (0, bankingModule_1.getBankLocalAccount)(`${msg.content}`);
        case "get/stats":
            return (0, statsModule_1.statsStrategy)();
        case "get/ticker/stat":
            return (0, statsModule_1.statStrategy)(msg.content);
        case "action/ping":
            return 1;
        case "get/pnl/daily":
            return (0, databaseOperator_1.getCumulativePNL)(msg.content);
        case "get/page/screenshot":
            return await (0, tradingViewParse_1.screenshotPage)(msg.content);
        case "get/bank/real":
            return await (0, util_1.getRealBalances)();
        case "get/trades/active":
            return await (0, databaseOperator_1.getActiveTrades)();
        case "trading/start":
            (0, databaseOperator_1.tradingSetState)(true);
            return 1;
        case "trading/stop":
            (0, databaseOperator_1.tradingSetState)(false);
            return 1;
        default:
            return undefined;
    }
}
exports.decomposeRequest = decomposeRequest;
//# sourceMappingURL=botsModule.js.map