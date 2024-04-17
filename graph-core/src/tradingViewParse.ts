import puppeteer from "puppeteer";

export const startBrowser = async () => {
    return await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox ', '--window-size=1920,1080'],
        defaultViewport: null
    });
}

export async function openTickerPage(openedtickers : Array<any>, ticker : string, browser : any) {
    ticker = ticker.toUpperCase();

    for(let _ticker of openedtickers) {
        if(_ticker.ticker === ticker)
            return;
    }

    let url = `https://www.tradingview.com/chart/nftmgQKz/?symbol=BINANCE%3A${ticker}`;

    const _page = await browser.newPage();
    await _page.goto(url);

    return {
        page: _page,
        ticker: ticker
    };
}

export async function closeTickerPage(openedtickers : Array<any>, ticker : string) {
    for(let obj of openedtickers) {
        if(obj.ticker === ticker.toUpperCase()) {
            obj.page.close();
            return { "success": true }
        }
    }

    return { "success": false }
}

export async function getTickerData(openedtickers : Array<any>, ticker : string, selObject : any) {
    let _page;
    let _objToReturn = {}

    openedtickers.forEach((obj) => {
        if(obj.ticker == ticker.toUpperCase())
            _page = obj.page;
    });

    if(!_page)
        return;

    if(_page.$('#overlap-manager-root > div:nth-child(2) > div') !== null) {
        let selToRem = '#overlap-manager-root > div:nth-child(2) > div';
        await _page.evaluate((sel) => {
            let elements = document.querySelectorAll(sel);
            for(let i=0; i< elements.length; i++){
                elements[i].parentNode.removeChild(elements[i]);
            }
        }, selToRem)
    }

    for(let key of Object.keys(selObject)) {
        await _page.waitForSelector(selObject[key],{visible:true,hidden:false});
        let element = await _page.$(selObject[key]);
        try {
            _objToReturn[key] = await _page.evaluate(element => element.textContent, element);
        } catch(err) {
            console.log(selObject[key], "error eval");
        }
    }

    return _objToReturn;
}