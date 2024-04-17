Object.defineProperty(exports, "__esModule", { value: true });
exports.math = void 0;
var math;
(function (math) {
    function getPercentile(value, percent) {
        return value * (percent / 100);
    }
    math.getPercentile = getPercentile;
    function getPercentDifferenceAbs(a, b) {
        return 100 * (Math.abs(a - b) / (Math.abs(a + b) / 2));
    }
    math.getPercentDifferenceAbs = getPercentDifferenceAbs;
    function getPercentDifference(a, b) {
        return (a - b) / 100;
    }
    math.getPercentDifference = getPercentDifference;
    function addPercent(value, percent) {
        return value + ((value / 100) * percent);
    }
    math.addPercent = addPercent;
})(math = exports.math || (exports.math = {}));
//# sourceMappingURL=math.js.map