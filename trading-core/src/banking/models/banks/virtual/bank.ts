import {Ticker} from "../../tickers/ticker";

export class Bank {
    // @ts-ignore
    readonly ticker: Ticker = undefined;
    // Тип валюты аккаунта можно определить через ticker.last
    private account: number = 0.0;

    constructor(ticker: Ticker, account: number) {
        this.ticker = ticker;
        this.account = account;
    }

    getBankSymbol():string {
        if (this.ticker === undefined || this.ticker.getName() === undefined)
            return "NONE"
        // @ts-ignore
        return this.ticker.getName();
    }

    getAccount() : number {
        return this.account;
    }

    getAccountSymbol() : string{
        if(this.ticker === undefined)
            return "NONE";
        return this.ticker.last;
    }

    // При взятии со счета денег, будет возвращено undefined при отсутствия дсотаточно количества на счету
    doTransaction(type:Transaction, value:number): number|undefined {
        switch (type){
            case Transaction.Deposit:
                this.account += value;
                break;
            case Transaction.Withdraw:
                if(this.account > value) {
                    this.account -= value;
                    return value;
                }
                break;
        }
        return undefined;
    }
}

export enum Transaction{
    Deposit,
    Withdraw
}