const puppeteer = require('puppeteer');
const express = require('express');
const https = require('https');

const server = express();
server.use(express.urlencoded({
    extended: true
}));

server.use(express.json());

let scrape = async (videosrc) => {
  var url = '';
  if (videosrc.toLowerCase() === 'uisbotlive') {
    url = 'https://uis.mediaspace.kaltura.com/media/t/1_j82of7xw';
  } else {
    url = videosrc;
  }

    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']}); //
    const page = await browser.newPage();    

    var result = '';
    
        try {
          await page.goto(url);
            await page.waitForTimeout(200); //Wait for 200 millis to load
            
            console.log('\nScraping...');

            // Get entry id
            const elementHandle = await page.$('.mwEmbedKalturaIframe')
            const frame = await elementHandle.contentFrame();
            const entryId = await frame.$eval('#pid_kplayer', el =>
            el.getAttribute("kentryid"));

            result = entryId;
        } catch (err) {
          console.error(err.message);
          result = '';
        }
    
    browser.close();
    return result; // Return the data
};

// Create an instance of the http server to handle HTTP requests
server.get('/getEntryId', (req, res) => {
  // console.log(req.query.videosrc);
    // Set a response type of plain text for the response
    res.writeHead(200, {'Content-Type': 'application/json'});

    scrape(req.query.videosrc).then((value) => {
        console.log(value); // Success!
        res.end(JSON.stringify(value));
    });
    // Send back a response and end the connection

});

// Listen to the specified port
server.listen((process.env.PORT || 8000), () => {
  console.log("Server is up and running...");
});