Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(ticker, TransactionType, amount, id) {
        this.TransactionType = undefined;
        this.Ticker = undefined;
        this.amount = undefined;
        this.ID = undefined;
        this.Ticker = ticker;
        this.TransactionType = TransactionType;
        this.amount = amount;
        this.ID = id;
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map