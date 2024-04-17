Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessage = void 0;
function formatMessage(query, obj) {
    let res = "";
    switch (query) {
        case "get/bank":
            res = format_getbank(obj);
            break;
        case "get/stats":
            res = format_getstats(obj);
            break;
        case "get/ticker/stat":
            res = format_get_ticker_stat(obj);
            break;
        case "action/ping":
            res = "1";
            break;
        case "get/pnl/daily":
            res = format_get_pnl(obj);
            break;
        case "get/bank/real":
            res = format_get_bank_real(obj);
            break;
        case "get/trades/active":
            res = format_active_trades(obj);
            break;
        default:
            res = undefined;
    }
    return res;
}
exports.formatMessage = formatMessage;
function format_getbank(obj) {
    let str = "<i>Bank Statement</i>\n\n";
    obj.forEach((bankAccount, index) => {
        if (index !== obj.length - 1) {
            str += `<code>${bankAccount.symbol}</code> | \$<i>${bankAccount.collFree}</i> | \$<i>${bankAccount.collTrade}</i>`;
            if (index !== obj.length - 2)
                str += `\n${'='.repeat(bankAccount.symbol.length + 1)}\n`;
        }
        else
            str += `\n\n<b>Total bank</b>: \$<i>${bankAccount['Total bank']}</i>\n<b>Margin</b>: \$${bankAccount.Margin}\n<b>Percent</b>: ${bankAccount['Bank percentage']}`;
    });
    return str;
}
function format_getstats(obj) {
    let str = `<b>Total</b>: ${obj.totalTrades}\n<b>Profit Trades</b>: ${obj.profitAmount} (${obj.profitRatio.toFixed(2)}%)\n<b>Loss Trades</b>: ${obj.lossAmount} (${obj.lossRatio.toFixed(2)}%)
${'='.repeat(10)}\n${obj.closeActions[0]} ✅ | ${obj.closeActions[1]} ❌ | ${obj.closeActions[2]} ⌛️ | ${obj.closeActions[3]} ⚠️
Filter 20: ${obj.sumBars.toFixed(4)}\nFilter Ichimoku: ${obj.sumIchimoku.toFixed(4)}`;
    return str;
}
function format_get_ticker_stat(obj) {
    let str = `<code>${obj.ticker}</code> info\n
<b>Total</b>: ${obj.totaltrades}\n<b>Profit trades</b>: ${obj.profitAmount}\n<b>Loss trades</b>: ${obj.lossAmount}\n${'='.repeat(10)}
<b>Total AW</b>: ${obj.profitEff - obj.lossEff}\n<b>Average profit weight</b>: ${obj.profitEff}\n<b>Average loss weight</b>: ${obj.lossEff}
${'='.repeat(10)}\n<b>Filter 20</b>: ${obj.sumBars.toFixed(2)}\n<b>Filter Ichimoku</b>: ${obj.sumIchimoku.toFixed(2)}
${obj.closeActions[0]} ✅ | ${obj.closeActions[1]} ❌ | ${obj.closeActions[2]} ⌛️ | ${obj.closeActions[3]} ⚠️
${'='.repeat(10)}\nROI: ${obj.ROI}%`;
    return str;
}
function format_get_pnl(obj) {
    return `<b>\$</b><i>${obj}</i>`;
}
function format_get_bank_real(obj) {
    let str = "<i>Futures balance</i>\n\n";
    let sum = 0;
    obj.totalBalance.forEach((arr) => {
        str += `\$${arr.asset} balance is \$${Number(arr.balance).toFixed(2)}\n`;
    });
    str += `Collateral balance: \$${obj.accounts.length * obj.defBank}\n\n`;
    obj.accounts.forEach((account, index) => {
        str += `<code>${account.symbol}</code> | \$<i>${Number(account.account).toFixed(2)}</i> <b>|</b> \$<i>${obj.defBank}</i> <b>|</b> \$<i>${(Number(account.account) - obj.defBank).toFixed(2)}</i>\n`;
        sum += Number(account.account);
        if (index !== obj.accounts.length - 1)
            str += '='.repeat(account.symbol.length + 1) + "\n";
    });
    let margin = (sum - (obj.defBank * obj.accounts.length)).toFixed(2);
    let percentage = (((sum / (obj.defBank * obj.accounts.length)) - 1) * 100).toFixed(2);
    str += `\n<i>Margin:</i> <b>\$${margin}</b>\n<i>Percentage:</i> <b>${percentage}%</b>`;
    return str;
}
function format_active_trades(obj) {
    if (obj.length === 0)
        return "There is no active trades at this moment";
    else {
        let str = "";
        obj.forEach((trade) => {
            if (trade.activetrade_local && trade.activetrade_binance) {
                str += `#${trade.activetrade_local.id} | <code>${trade.activetrade_local.ticker}</code> | <i>${trade.activetrade_local.quantity}</i> \$${trade.activetrade_local.ticker.replace('USDT', '')} | 🟢\n`;
            }
            else if (!trade.activetrade_local && trade.activetrade_binance) {
                str += `${trade.activetrade_binance.symbol} | \@steelzer0 | Warning, extra trade is still active on binance! \n`;
            }
        });
        return str;
    }
}
//# sourceMappingURL=messageFormer.js.map