//importing 'testannotations the test module from Playwright
const {test} = require('@playwright/test');

//test launches the browser and opens a new page

//test anotation passing 2 arguments, the first is the name of the test and the second is an async function that contains the test code
test('Browser context playwright test', async ({ page }) => {
    // newContext() method is used to create a new browser context. A browser context is an isolated environment where you can create multiple pages and run tests in parallel without interfering with each other.
    // newPage() method is used to create a new page in the browser context. A page is a single tab in the browser where you can navigate to different URLs and interact with the web page.
    
    const chromeContext = await browser.newContext();
   const page = await chromeContext.newPage();
   await page.goto('https://www.google.com');
   await page.screenshot({ path: 'screenshot.png' });

});

test('page playwright test', async ({ page }) => {
    await page.goto('https://www.google.com');
});