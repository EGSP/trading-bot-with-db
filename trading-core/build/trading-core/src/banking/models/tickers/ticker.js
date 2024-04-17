Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticker = void 0;
class Ticker {
    constructor(first, last) {
        this.first = undefined;
        this.last = undefined;
        this.first = first;
        this.last = last;
    }
    toString() {
        return this.getName();
    }
    getName() {
        if (this.first !== undefined && this.last !== undefined)
            return this.first + this.last;
        return undefined;
    }
}
exports.Ticker = Ticker;
//# sourceMappingURL=ticker.js.map