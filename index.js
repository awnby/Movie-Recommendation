import pw from 'playwright';
import retry from 'async-retry';

const SBR_CDP = `wss://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`;

const takeScreenshot = async (page, log) => {
    console.log(log ? log : 'Taking screenshot to page.png');
    await page.waitForTimeout(3000);  // Add delay before screenshot
    await page.screenshot({ path: 'page.png', fullPage: true, timeout: 60000 });
}

async function main() {
    console.log("Connecting to Scraping Browser...");
    const browser = await pw.chromium.connectOverCDP(SBR_CDP);
    console.log("Navigating...");
    const page = await browser.newPage();

    try {
        await page.goto('https://www.imdb.com/chart/top/', { timeout: 3 * 60 * 1000 });
        await page.waitForSelector('.ipc-title-link-wrapper', { timeout: 120000 });
        await takeScreenshot(page, "Navigated! Scraping some content...");

        await page.locator('.ipc-title-link-wrapper').first().click();
        await takeScreenshot(page, "Reached Shawshank Redemption");

        await page.getByLabel('User reviews').first().click();
        await takeScreenshot(page, "Reading reviews for Shawshank Redemption...");
        const reviewText = await page.locator('div.ipc-html-content-inner-div[role="presentation"]').textContent();
        console.log("Extracted Review Text:", reviewText);
        
        /*
        
const takeScreenshot = async (page, log) => {
    console.log(log ? log : 'Taking screenshot to page.png');
    //await page.waitForFunction('document.fonts.ready', { timeout: 120000 });
    //await page.screenshot({ path: 'page.png', fullPage: true });

}


    try {
        // get to the top 250 movies list
        await page.goto('https://www.imdb.com/chart/top/', { timeout: 3 * 60 * 1000 });
        await page.waitForSelector('.ipc-title-link-wrapper', { timeout: 120000 });
        await takeScreenshot(page, "Navigated! Scraping some content...");
        
        // grab the first link (the first movie)
        await page.locator('.ipc-title-link-wrapper').first().click();
        await takeScreenshot(page, "Reached Shawshank Redemption");

        // Find the reviews for the first movie
        // Ensure the page is fully loaded before proceeding
        await page.waitForLoadState('domcontentloaded');

        // Scroll to the user reviews button and click it
        await page.waitForSelector('span.label', { state: 'visible', timeout: 120000 });
        await page.locator('span.label').first().scrollIntoViewIfNeeded();
        await page.locator('span.label').first().click();

        await takeScreenshot(page, "Reading reviews for Shawshank Redemption...");

        
        // set the sort by selector to total votes
        await page.waitForSelector('#sort-by-selector', {timeout: 120000});
        await page.getByLabel('Featured').first().selectOption({value: 'TOTAL_VOTES'});
        await takeScreenshot(page, "Sorted reviews by Total votes");

        // grab the first review and print it
        await page.waitForSelector('div.ipc-html-content-inner-div[role="presentation"]', { timeout: 120000 });
        const reviewText = await page.locator('div.ipc-html-content-inner-div[role="presentation"]').textContent();
        console.log("Extracted Review Text:", reviewText);
        await takeScreenshot(page, "Extracted review content");
*/





    } catch (err) {
        await takeScreenshot(page, 'Error');
        console.error('Error occurred:', err);
        throw err;
    } finally {
        await browser.close();
    }
}

await retry(main, {
    retries: 3,
    onRetry: (err) => {
        console.error('Retrying due to error:', err.message);
    }
});
