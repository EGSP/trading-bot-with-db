"use strict";
exports.__esModule = true;
exports.Ticker = void 0;
var Ticker = /** @class */ (function () {
    function Ticker(first, last) {
        // @ts-ignore
        this.first = undefined;
        // @ts-ignore
        this.last = undefined;
        this.first = first;
        this.last = last;
    }
    Ticker.prototype.toString = function () {
        // @ts-ignore
        return this.getName();
    };
    Ticker.prototype.getName = function () {
        if (this.first !== undefined && this.last !== undefined)
            return this.first + this.last;
        return undefined;
    };
    return Ticker;
}());
exports.Ticker = Ticker;
