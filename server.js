const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({extend: false}));
app.use(express.json());

const PORT = 3131;
const HOST = '127.0.0.1';

global.url_crawl = "";
global.apiStoreData = "";
global.apiLogin = "http://127.0.0.1:8000/api/login";
global.apiToken = "Bearer ";
global.host = HOST;
global.port = PORT;

router.get('/', function(req, res) {
    res.status(200).send('Hello world');
});

router.post('/crawlerGo', (req,res) => {
    console.log(req.body);

    global.url_crawl = 'https://aj-dongli.x.yupoo.com/albums?tab=gallery';
    global.apiStoreData = 'http://127.0.0.1:8000/api/products';

    const browserObject = require('./browser');
    let scraperController = require('./pageController');
    let browserInstance = browserObject.startBrowser();

    axios.post(global.apiLogin, {
        // email:'nodejscrawler@admin.com',
        // password:'123123123'
        email:'admin@gmail.com',
        password:'admin123'
    })
        .then((res) => {
            console.log(`Status: ${res.status}`);
            console.log('Body: ', res.data);
            console.log('token', res.data.data.token);
            global.apiToken += res.data.data.token;
            scraperController(browserInstance);
        }).catch((err) => {
            console.error(err);
        });

    res.status(200).send('Hello post request');
})

app.use("/", router);

const publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir)); 

app.listen( PORT, function() {
    console.log(`Server is running on: ${HOST}:${PORT}`);
});
