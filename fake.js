import pw from 'playwright';
import retry from 'async-retry';
import fs from 'fs/promises';


const SBR_CDP = `wss://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`;

async function main() {
    console.log("Connecting to Scraping Browser...");
    const browser = await pw.chromium.connectOverCDP(SBR_CDP);
    console.log("Navigating...");
    const page = await browser.newPage();

    try {
        await page.goto('https://www.imdb.com/chart/top/', { waitUntil: 'domcontentloaded', timeout: 5 * 60 * 1000 });
        console.log("Navigated to IMDB top movies.");


        // // Navigate to the "User reviews" section
        const movieList = await page.locator('div[data-testid="chart-layout-main-column"] ul.ipc-metadata-list > li');
        // const movieCount = await movieList.count();

        const moviesData=[];

        for (let i = 0; i < 250; i++) {
            await page.waitForTimeout(5000);
            console.log(`Processing movie ${i + 1}...`);
        
            const movieLinkElement = await movieList.nth(i).locator('a.ipc-title-link-wrapper');
            const movieHref = await movieLinkElement.getAttribute('href');
            const movieTitle = await movieLinkElement.textContent();
        
            if (!movieHref) continue;
        
            const movieUrl = `https://www.imdb.com${movieHref}`;
            console.log(`Navigating to movie: ${movieTitle} (${movieUrl})`);
        
            try {
                await page.locator(`#__next > main > div > div.ipc-page-content-container.ipc-page-content-container--center > section > div > div.ipc-page-grid.ipc-page-grid--bias-left > div > ul > li:nth-child(${i+1}) > div > div > div > div > div.sc-300a8231-0.gTnHyA.cli-children > div.ipc-title.ipc-title--base.ipc-title--title.ipc-title-link-no-icon.ipc-title--on-textPrimary.sc-a69a4297-2.bqNXEn.cli-title.with-margin > a`).click();
                // await page.waitForTimeout(3000); // Add a 3-second delay
                console.log(`Navigating to reviews for ${movieTitle}...`);

                await page.getByRole('link', { name: 'User reviews' }).first().click();
                console.log(`Navigated to reviews for ${movieTitle}.`);

                // Wait for reviews to load
                await page.waitForSelector('div.ipc-html-content-inner-div[role="presentation"]', { timeout: 120000 });

                // Collect the first 10 reviews
                const reviewsList = [];
                const reviewParentDiv = await page.locator('div.sc-c0933c3e-1.fQDAuW.ipc-page-grid__item');
                const reviewArticles = reviewParentDiv.locator('article.sc-7d2e5b85-1.cvfQlw.user-review-item');

                const reviewsCount = Math.min(await reviewArticles.count(), 10); // Get up to 10 reviews

                for (let j = 0; j < reviewsCount; j++) {
                    const reviewContainer = reviewArticles.nth(j);
                    // Check for and click the spoiler button if present
                    const spoilerButton = await reviewContainer.locator('.ipc-btn__text').first();
                    if (await spoilerButton.count() > 0) {
                        await spoilerButton.click(); // Reveal the spoiler content
                        console.log(`Unspoiled review ${j + 1} for ${movieTitle}.`);
                    }

                    // Extract the review text
                    const reviewText = await reviewContainer.locator('div.ipc-html-content-inner-div[role="presentation"]').textContent();
                    reviewsList.push(reviewText.trim());
                }

                // Store movie title and reviews in the dataset
                moviesData.push({
                    title: movieTitle,
                    reviews: reviewsList
                });

                console.log(`Extracted ${reviewsList.length} reviews for ${movieTitle}.`);
            } catch (err) {
                console.error(`Failed to navigate to movie page: ${movieUrl}. Error: ${err.message}`);
                continue; // Skip to the next movie
            } finally {
                page.goBack()
            }
        }

        console.log("Finished scraping all movies.");
        console.log("Final Dataset:", moviesData);

        await fs.writeFile('imdb_top_250_reviews.json', JSON.stringify(moviesData, null, 2));
        console.log("Data saved to imdb_top_250_reviews.json.");
    } catch (err) {
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
