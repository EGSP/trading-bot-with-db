import express, { Express, Request, Response } from 'express';
// @ts-ignore
import config from '../config.json';
import {closeTickerPage, getTickerData, openTickerPage, startBrowser} from "./src/tradingViewParse";

const app : Express = express();
let browser;
let queriedTickers = [];

app.get("/openPage/:ticker/", async (req, res) => {
    let response = await openTickerPage(queriedTickers, req.params.ticker, browser);
    if(response)
        queriedTickers.push(response);

    res.send(response);
});

app.get("/getData/:ticker/", async (req, res) => {
    let _wasFound = false;
    for(let pair of queriedTickers)
        if(pair.ticker === req.params.ticker.toUpperCase()) {
            _wasFound = true;
            let response = await getTickerData(queriedTickers, req.params.ticker, config.selectorsObject);
            res.send(response);
        }

    if(!_wasFound)
        res.send({
            "success": false
        })
});

app.get("/closePage/:ticker", async (req, res) => {
    let response = await closeTickerPage(queriedTickers, req.params.ticker);

    if(response.success)
        queriedTickers.forEach((ticker, index) => {
            if(ticker.ticker.toUpperCase() === req.params.ticker.toUpperCase())
                queriedTickers.splice(index, 1);
        });

    res.send(response);
});

app.listen(config.app_port, async () => {
    browser = await startBrowser()
    console.log('TV.P server is listening...');
});