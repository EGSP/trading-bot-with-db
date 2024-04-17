"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_json_1 = __importDefault(require("../config.json"));
const tradingViewParse_1 = require("./src/tradingViewParse");
const app = (0, express_1.default)();
let browser;
let queriedTickers = [];
app.get("/openPage/:ticker/", async (req, res) => {
    let response = await (0, tradingViewParse_1.openTickerPage)(queriedTickers, req.params.ticker, browser);
    if (response)
        queriedTickers.push(response);
    res.send(response);
});
app.get("/getData/:ticker/", async (req, res) => {
    let _wasFound = false;
    for (let pair of queriedTickers)
        if (pair.ticker === req.params.ticker.toUpperCase()) {
            _wasFound = true;
            let response = await (0, tradingViewParse_1.getTickerData)(queriedTickers, req.params.ticker, config_json_1.default.selectorsObject);
            res.send(response);
        }
    if (!_wasFound)
        res.send({
            "success": false
        });
});
app.get("/closePage/:ticker", async (req, res) => {
    let response = await (0, tradingViewParse_1.closeTickerPage)(queriedTickers, req.params.ticker);
    if (response.success)
        queriedTickers.forEach((ticker, index) => {
            if (ticker.ticker.toUpperCase() === req.params.ticker.toUpperCase())
                queriedTickers.splice(index, 1);
        });
    res.send(response);
});
app.listen(config_json_1.default.app_port, async () => {
    browser = await (0, tradingViewParse_1.startBrowser)();
    console.log('TV.P server is listening...');
});
//# sourceMappingURL=index.js.map