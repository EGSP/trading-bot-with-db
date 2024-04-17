import {transactionType} from "./transactionType";
import {getDatabase} from "../databaseOperator";

export class Transaction {
    readonly TransactionType : transactionType = undefined;
    readonly Ticker : string = undefined;
    readonly amount : number = undefined;
    readonly ID : string = undefined;

    constructor(ticker : string, TransactionType : transactionType, amount : number, id : string) {
        this.Ticker = ticker;
        this.TransactionType = TransactionType;
        this.amount = amount;
        this.ID = id;
    }
}