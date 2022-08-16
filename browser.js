// ./book-scraper/browser.js
const puppeteer = require('puppeteer');

getBrowserProxy: async (proxy) => {
    return await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
            '--proxy-server=' + proxy,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized',
        ]
    });
};

async function startBrowser(){
    let browser;
    try {
        console.log("Opening the browser......");
        browser = await puppeteer.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
};

module.exports = {
    startBrowser
};
