const express = require("express");
const { default: puppeteer } = require("puppeteer");

const port = process.env.PORT || 4000;
const app = express();

app.get('/', (req, res) => {
    res.send("Render Puppeteer");
})

app.get('/scrape', async (req, res) => {

    const browser = await puppeteer.launch({
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--single-process",
            "--no-zygote"
        ],
        executablePath: process.env.NODE_ENV === 'production' 
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),

    });
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto('https://developer.chrome.com/');

    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box.
    await page.locator('.devsite-search-field').fill('automate beyond recorder');

    // Wait and click on first result.
    await page.locator('.devsite-result-item-link').click();

    // Locate the full title with a unique string.
    const textSelector = await page
        .locator('text/Customize and automate')
        .waitHandle();
    const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title.
    res.send(fullTitle);
    console.log('The title of this blog post is "%s".', fullTitle);

    await browser.close();
})

app.listen(port, () => {
    console.log('Server is on');
})