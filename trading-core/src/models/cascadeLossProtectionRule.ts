import {sideType} from "./sideType";
import {getDatabase, getLast, pushLast} from "../databaseOperator";
import config = require('../../config');

export class cascadeLossProtectionRule {
    readonly timestamp : number = undefined;
    readonly restricted : boolean = undefined;
    readonly side : sideType = undefined;

    constructor(restricted : boolean, timestamp : number, side : sideType, ticker : string) {
        this.restricted = restricted;
        this.timestamp = timestamp;
        this.side = side;
    }

    static getCascadeRuleState(ticker : string) : cascadeLossProtectionRule {
        let db = getDatabase(ticker, 'rules/cascadeRules/')

        let _obj = getLast(db, 'cascadeLossProtectionRules');
        if(!_obj) {
            _obj = new cascadeLossProtectionRule(false, Number(new Date().valueOf()), sideType.long, ticker);
            pushLast(db, 'cascadeLossProtectionRules', _obj);
        }

        return _obj;
    }
}