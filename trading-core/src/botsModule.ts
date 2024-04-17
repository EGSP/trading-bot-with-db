import {getBankAccountsStatement, getBankLocalAccount} from "./banking/bankingModule";
import {statsStrategy, statStrategy} from "./statsModule";
import {getActiveTrades, getCumulativePNL, tradingSetState} from "./databaseOperator";
import {screenshotPage} from "./tradingViewParse";
import {getRealBalances} from "./binance/util";

export async function decomposeRequest(msg) {
    switch(msg.query) {
        case "get/bank":
            return getBankAccountsStatement();
        case "get/account":
            return getBankLocalAccount(`${msg.content}`);
        case "get/stats":
            return statsStrategy();
        case "get/ticker/stat":
            return statStrategy(msg.content);
        case "action/ping":
            return 1;
        case "get/pnl/daily":
            return getCumulativePNL(msg.content);
        case "get/page/screenshot":
            return await screenshotPage(msg.content);
        case "get/bank/real":
            return await getRealBalances();
        case "get/trades/active":
            return await getActiveTrades();
        case "trading/start":
            tradingSetState(true);
            return 1;
        case "trading/stop":
            tradingSetState(false);
            return 1;
        default:
            return undefined;
    }
}