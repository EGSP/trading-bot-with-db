Object.defineProperty(exports, "__esModule", { value: true });
exports.doWithdrawChunks = exports.getMargin = void 0;
const bank_1 = require("../../models/banks/virtual/bank");
const math_1 = require("../maths/math");
var getPercentile = math_1.math.getPercentile;
function getMargin(bank, chunksCount, percentOfAccount, threshold) {
    const margin = getPercentile(bank.getAccount(), percentOfAccount);
    if (margin < threshold)
        return undefined;
    const chunkMargin = margin / chunksCount;
    const chunks = new Array(chunksCount);
    for (let i = chunks.length - 1; i >= 0; i--) {
        chunks[i] = chunkMargin;
    }
    return chunks;
}
exports.getMargin = getMargin;
function doWithdrawChunks(bank, chunks) {
    for (let i = chunks.length - 1; i >= 0; i--) {
        bank.doTransaction(bank_1.Transaction.Withdraw, chunks[i]);
    }
}
exports.doWithdrawChunks = doWithdrawChunks;
//# sourceMappingURL=functions.js.map