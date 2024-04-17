Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.Bank = void 0;
class Bank {
    constructor(ticker, account) {
        this.ticker = undefined;
        this.account = 0.0;
        this.ticker = ticker;
        this.account = account;
    }
    getBankSymbol() {
        if (this.ticker === undefined || this.ticker.getName() === undefined)
            return "NONE";
        return this.ticker.getName();
    }
    getAccount() {
        return this.account;
    }
    getAccountSymbol() {
        if (this.ticker === undefined)
            return "NONE";
        return this.ticker.last;
    }
    doTransaction(type, value) {
        switch (type) {
            case Transaction.Deposit:
                this.account += value;
                break;
            case Transaction.Withdraw:
                if (this.account > value) {
                    this.account -= value;
                    return value;
                }
                break;
        }
        return undefined;
    }
}
exports.Bank = Bank;
var Transaction;
(function (Transaction) {
    Transaction[Transaction["Deposit"] = 0] = "Deposit";
    Transaction[Transaction["Withdraw"] = 1] = "Withdraw";
})(Transaction = exports.Transaction || (exports.Transaction = {}));
//# sourceMappingURL=bank.js.map