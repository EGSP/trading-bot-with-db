"use strict";
exports.__esModule = true;
exports.Transaction = exports.Bank = void 0;
var Bank = /** @class */ (function () {
    function Bank(ticker) {
        // @ts-ignore
        this.ticker = undefined;
        // Тип валюты аккаунта можно определить через ticker.last
        this.account = 0.0;
        this.ticker = ticker;
    }
    Bank.prototype.getBankSymbol = function () {
        if (this.ticker === undefined || this.ticker.getName() === undefined)
            return "NONE";
        // @ts-ignore
        return this.ticker.getName();
    };
    Bank.prototype.getAccount = function () {
        return this.account;
    };
    Bank.prototype.getAccountSymbol = function () {
        if (this.ticker === undefined)
            return "NONE";
        return this.ticker.last;
    };
    // При взятии со счета денег, будет возвращено undefined при отсутствия дсотаточно количества на счету
    Bank.prototype.doTransaction = function (type, value) {
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
    };
    return Bank;
}());
exports.Bank = Bank;
var Transaction;
(function (Transaction) {
    Transaction[Transaction["Deposit"] = 0] = "Deposit";
    Transaction[Transaction["Withdraw"] = 1] = "Withdraw";
})(Transaction = exports.Transaction || (exports.Transaction = {}));
