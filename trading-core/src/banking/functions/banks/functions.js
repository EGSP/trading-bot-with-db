"use strict";
exports.__esModule = true;
exports.doWithdrawChunks = exports.getMargin = void 0;
var bank_1 = require("../../models/banks/virtual/bank");
var math_1 = require("../maths/math");
var getPercentile = math_1.math.getPercentile;
function getMargin(bank, chunksCount, percentOfAccount, threshold) {
    var margin = getPercentile(bank.getAccount(), percentOfAccount);
    if (margin < threshold)
        return undefined;
    var chunkMargin = margin / chunksCount;
    var chunks = new Array(chunksCount);
    for (var i = chunks.length - 1; i >= 0; i--) {
        chunks[i] = chunkMargin;
    }
    return chunks;
}
exports.getMargin = getMargin;
function doWithdrawChunks(bank, chunks) {
    for (var i = chunks.length - 1; i >= 0; i--) {
        bank.doTransaction(bank_1.Transaction.Withdraw, chunks[i]);
    }
}
exports.doWithdrawChunks = doWithdrawChunks;
