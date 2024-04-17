Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshotPage = exports.getTradeInfo = exports.openPages = void 0;
const database_I = require("./databaseOperator");
async function openPages() {
    let url = `https://www.tradingview.com/chart/nftmgQKz/?symbol=BINANCE%3A`;
    let _page;
    let _pages = [];
    let tickers = database_I.getAllTickers();
    for (let i = 0; i < tickers.length; i++) {
        _page = await global.browser.newPage();
        await _page.goto(url + tickers[i], {
            waitUntil: 'load',
            timeout: 0
        });
        await _page.waitForSelector('span[class$=\'highlight-maJ2WnzA price-qWcO4bp9\']', {
            waitUntil: 'load',
            timeout: 0
        });
        _pages.push(_page);
    }
    return _pages;
}
exports.openPages = openPages;
async function getTradeInfo(page) {
    let selectors = [];
    let text = [];
    let element;
    for (let i = 1; i < 10; i++) {
        if (![4, 7].includes(i))
            selectors.push(`body > div.js-rootresizer__contents.layout-with-border-radius > div.layout__area--center > div > div.chart-container-border > div > table > tr:nth-child(1) > td.chart-markup-table.pane > div > div.legend-l31H9iuA.noWrap-l31H9iuA.noActions-l31H9iuA.wrappable-l31H9iuA > div.sourcesWrapper-l31H9iuA > div.sources-l31H9iuA > div:nth-child(3) > div.valuesWrapper-l31H9iuA > div > div:nth-child(${i}) > div`);
    }
    selectors.push('body > div.js-rootresizer__contents.layout-with-border-radius > div.layout__area--center > div > div.chart-container-border > div > table > tr:nth-child(1) > td.chart-markup-table.pane > div > div.legend-l31H9iuA.noWrap-l31H9iuA.noActions-l31H9iuA.wrappable-l31H9iuA > div.sourcesWrapper-l31H9iuA > div.sources-l31H9iuA > div:nth-child(2) > div.valuesWrapper-l31H9iuA > div > div:nth-child(7) > div');
    selectors.push('body > div.js-rootresizer__contents.layout-with-border-radius > div.layout__area--center > div > div.chart-container-border > div > table > tr:nth-child(1) > td.chart-markup-table.pane > div > div.legend-l31H9iuA.noWrap-l31H9iuA.noActions-l31H9iuA.wrappable-l31H9iuA > div.sourcesWrapper-l31H9iuA > div.sources-l31H9iuA > div:nth-child(2) > div.valuesWrapper-l31H9iuA > div > div:nth-child(9) > div');
    selectors.push('body > div.js-rootresizer__contents.layout-with-border-radius > div.layout__area--center > div > div.chart-container-border > div > table > tr:nth-child(1) > td.chart-markup-table.pane > div > div.legend-l31H9iuA.noWrap-l31H9iuA.noActions-l31H9iuA.wrappable-l31H9iuA > div.sourcesWrapper-l31H9iuA > div.sources-l31H9iuA > div:nth-child(2) > div.valuesWrapper-l31H9iuA > div > div:nth-child(11) > div');
    selectors.push('span[class$=\'priceWrapper-qWcO4bp9\']');
    selectors.push('span[class$=\'title-ZJX9Rmzv\']');
    await page.waitForSelector(selectors[0], { visible: true, hidden: false });
    for (let i = 0; i < selectors.length; i++) {
        element = await page.$(selectors[i]);
        try {
            text.push(await page.evaluate(element => element.textContent, element));
        }
        catch (err) {
            console.log(selectors[i]);
            throw err;
        }
    }
    text[11] = text[11].replace('\.P', '');
    text[10] = text[10].replace('RUSDT', '');
    return {
        "middle": text[0],
        "sell": [
            text[1],
            text[2]
        ],
        "buy": [
            text[3],
            text[4]
        ],
        "filters": [
            text[5],
            text[6]
        ],
        "middle_ichimoku": text[7],
        "ichi_channel": [
            text[8],
            text[9]
        ],
        "ticker": text[11],
        "currentPrice": text[10],
        "page": page
    };
}
exports.getTradeInfo = getTradeInfo;
async function screenshotPage(symbol) {
    for (let i = 0; i < global.pages.length; i++) {
        const element = await global.pages[i].$('span[class$=\'title-ZJX9Rmzv\']');
        const text = await global.pages[i].evaluate(element => element.textContent, element);
        if (text.replace('.P', '') === symbol.toUpperCase()) {
            if (await global.pages[i].$('body > div:nth-child(9) > div > div > div') !== null) {
                let div_selector_to_remove = 'body > div:nth-child(9) > div > div > div';
                await global.pages[i].evaluate((sel) => {
                    let elements = document.querySelectorAll(sel);
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, div_selector_to_remove);
            }
            if (await global.pages[i].$('#overlap-manager-root > div:nth-child(4) > div') !== null) {
                let div_selector_to_remove = '#overlap-manager-root > div:nth-child(4) > div';
                await global.pages[i].evaluate((sel) => {
                    let elements = document.querySelectorAll(sel);
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, div_selector_to_remove);
            }
            if (await global.pages[i].$('#overlap-manager-root > div:nth-child(2) > div') !== null) {
                let div_selector_to_remove = '#overlap-manager-root > div:nth-child(2) > div';
                await global.pages[i].evaluate((sel) => {
                    let elements = document.querySelectorAll(sel);
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }, div_selector_to_remove);
            }
            let screenshot = await global.pages[i].screenshot({ type: 'png', encoding: 'base64' });
            return screenshot;
        }
    }
}
exports.screenshotPage = screenshotPage;
//# sourceMappingURL=tradingViewParse.js.map