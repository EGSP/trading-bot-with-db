import {Bank, Transaction} from "../../models/banks/virtual/bank";
import {math} from "../maths/math";
import getPercentile = math.getPercentile;

export function getMargin(bank: Bank,chunksCount: number, percentOfAccount: number, threshold: number):
    number[] | undefined {
    const margin = getPercentile(bank.getAccount(), percentOfAccount);
    if (margin < threshold)
        return undefined;

    const chunkMargin = margin / chunksCount;
    const chunks = new Array(chunksCount);
    for (let i = chunks.length - 1; i >= 0; i--) {
        chunks[i]=chunkMargin;
    }

    return chunks;
}

export function doWithdrawChunks(bank: Bank, chunks: number[]){
    for (let i = chunks.length - 1; i >= 0; i--) {
        bank.doTransaction(Transaction.Withdraw, chunks[i]);
    }
}