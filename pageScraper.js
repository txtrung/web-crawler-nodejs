// ./book-scraper/pageScraper.js

const axios = require('axios');
const fs = require('fs');

const scraperObject = {
    // url: process.argv[2],
    // protocol: process.argv[2].toString().split("//")[0],
    // apiStoreData: process.argv[3].toString(),
    url: global.url_crawl,
    protocol: global.url_crawl.split("//")[0],
    apiStoreData: global.apiStoreData,
    productError: [],
    pageError: [],

    async getItemData(page){
        let self = this;

        await page.waitForSelector('.showindex__parent');

        let urls = await page.$$eval('.showindex__children', links => {
            links = links.map(el => el.querySelector('a').href)
            return links;
        });

        let pagePromise = (link) => new Promise(async(resolve, reject) => {
            try {
                let dataObj = {};

                let shortLink = "/"+link.split('/').slice(-2).join('/')
                    productId = link.split('?')[0].split('/').at(-1);
                ;

                let folderName = `public/${productId}`;
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                }

                await page.click(`a[href="${shortLink}"]`);
                await page.waitForSelector('.showalbumheader__main');

                let productImagesEle = await page.$('.showalbumheader__gallerycover');
                await productImagesEle.screenshot({
                    path: `${folderName}/${productId}-main.jpg`
                });
                dataObj['image_url'] = `${folderName}/${productId}-main.jpg`;


                console.log('adsasdasdasdasdasdasdasdasdasdasdasdasdasdas');


                dataObj['name'] = await page.$eval('.showalbumheader__gallerydec h2 span', text => text.textContent);
                dataObj['size_available'] = await page.$eval('.showalbumheader__gallerysubtitle', text => text.textContent.split('\n')[0]);

                productImagesEle = await page.$$('.image__imagewrap');
                let imagesDir = [];
                for (let i = 0 ; i < productImagesEle.length ; i++) {
                    imagesDir.push(`${folderName}/${productId}-${i}.jpg`);
                    await productImagesEle[i].screenshot({
                        path: `${folderName}/${productId}-${i}.jpg`
                    });
                }
                dataObj['other_images_url'] = imagesDir;

                resolve(dataObj);
            } catch (error) {
                console.log(`Scraping data error at: ${link}`);
                console.log(error);
                self.productError.push(link);
                // reject('error');
                resolve('error');
            }

        });

        let currentPageData = {
            data : [],
            isError : false
        };
        for(link in urls){
            
            let result = await pagePromise(urls[link]);
            if (result === 'error') {
                console.log(`wait for selector error`);
                console.log(urls[link]);
            } else {
                currentPageData['data'].push(result);
            }

            try {
                await page.goBack();
            } catch (error) {
                currentPageData['isError'] = true;
                return currentPageData;
            }
            
        }

        return currentPageData;
    },

    async scraper(browser){
        try {
            let self = this;
            let page = await browser.newPage();
            // page.setDefaultNavigationTimeout(0);
            // page.setDefaultTimeout(0);

            console.log(`Navigating to ${this.url}...`);

            await page.goto(this.url.toString(),{
                waitUntil: "networkidle2"
            });

            await page.waitForSelector('.pagination__main');

            let totalPages = await page.$eval('.pagination__jumpwrap span', text => text.textContent.match(/\d+/g));
            totalPages = parseInt(totalPages); 
            console.log(`total page: ${totalPages}`);

            let currentPage = 1;
            while (currentPage <= totalPages) {

                console.log(`current page: ${currentPage}`);

                if (currentPage !== 1) {
                    await page.goto(this.url.toString()+`&page=${currentPage}`,{
                        waitUntil: "networkidle2"
                    });
                }

                let currentPageData = await this.getItemData(page,browser);
                if (currentPageData['isError']) {
                    self.pageError.push(currentPage);
                }
                if (self.productError.length > 0) {
                    console.log(`Scraping data error list:`);
                    console.log(self.productError);
                }
                if (self.pageError.length > 0) {
                    console.log(`Scraping page error list:`);
                    console.log(self.pageError);
                }
                if (currentPageData['data'].length > 0) {
                    await axios.post(self.apiStoreData, currentPageData['data'], {
                        headers: {
                          'Authorization': global.apiToken
                        }
                      })
                    .then((res) => {
                        console.log(`Status: ${res.status}`);
                        console.log('Body: ', res.data);
                    }).catch((err) => {
                        console.error(err);
                    });
                }

                currentPage++;
                
            }

            await page.close()
        } catch (error) {
            console.log(`Go to page error: `);
            console.log(error);
        }
        
        
    }
}

module.exports = scraperObject;
