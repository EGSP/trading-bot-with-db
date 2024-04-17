Object.defineProperty(exports, "__esModule", { value: true });
exports.cascadeLossProtectionRule = void 0;
const sideType_1 = require("./sideType");
const databaseOperator_1 = require("../databaseOperator");
class cascadeLossProtectionRule {
    constructor(restricted, timestamp, side, ticker) {
        this.timestamp = undefined;
        this.restricted = undefined;
        this.side = undefined;
        this.restricted = restricted;
        this.timestamp = timestamp;
        this.side = side;
    }
    static getCascadeRuleState(ticker) {
        let db = (0, databaseOperator_1.getDatabase)(ticker, 'rules/cascadeRules/');
        let _obj = (0, databaseOperator_1.getLast)(db, 'cascadeLossProtectionRules');
        if (!_obj) {
            _obj = new cascadeLossProtectionRule(false, Number(new Date().valueOf()), sideType_1.sideType.long, ticker);
            (0, databaseOperator_1.pushLast)(db, 'cascadeLossProtectionRules', _obj);
        }
        return _obj;
    }
}
exports.cascadeLossProtectionRule = cascadeLossProtectionRule;
//# sourceMappingURL=cascadeLossProtectionRule.js.map