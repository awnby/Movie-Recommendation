import pw from 'playwright';
import retry from 'async-retry';

const SBR_CDP = `wss://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`;


const moviesDataset = ['The Shawshank Redemption',
    'The Godfather',
    'The Dark Knight',
    'The Godfather Part II',
    '12 Angry Men',
    "Schindler's List",
    'The Lord of the Rings: The Return of the King',
    'Pulp Fiction',
    'The Lord of the Rings: The Fellowship of the Ring',
    'The Good, the Bad and the Ugly',
    'Forrest Gump',
    'Fight Club',
    'The Lord of the Rings: The Two Towers',
    'Inception',
    'Star Wars: Episode V - The Empire Strikes Back',
    'The Matrix',
    'Goodfellas',
    "One Flew Over the Cuckoo's Nest",
    'Se7en',
    'Seven Samurai',
    "It's a Wonderful Life",
    'The Silence of the Lambs',
    'City of God',
    'Saving Private Ryan',
    'Interstellar',
    'Life Is Beautiful',
    'The Green Mile',
    'Star Wars: Episode IV - A New Hope',
    'Terminator 2: Judgment Day',
    'Back to the Future',
    'Spirited Away',
    'The Pianist',
    'Psycho',
    'Parasite',
    'Léon: The Professional',
    'The Lion King',
    'Gladiator',
    'American History X',
    'The Departed',
    'The Usual Suspects',
    'The Prestige',
    'Whiplash',
    'Casablanca',
    'Grave of the Fireflies',
    'Harakiri',
    'The Intouchables',
    'Modern Times',
    'Once Upon a Time in the West',
    'Rear Window',
    'Cinema Paradiso',
    'Alien',
    'City Lights',
    'Apocalypse Now',
    'Memento',
    'Django Unchained',
    'Indiana Jones and the Raiders of the Lost Ark',
    'WALL·E',
    'The Lives of Others',
    'Sunset Blvd.',
    'Paths of Glory',
    'The Shining',
    'The Great Dictator',
    'Avengers: Infinity War',
    'Witness for the Prosecution',
    'Aliens',
    'Spider-Man: Into the Spider-Verse',
    'American Beauty',
    'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    'The Dark Knight Rises',
    'Oldboy',
    'Inglourious Basterds',
    'Amadeus',
    'Coco',
    'Toy Story',
    'Joker',
    'Braveheart',
    'The Boat',
    'Avengers: Endgame',
    'Princess Mononoke',
    'Once Upon a Time in America',
    'Good Will Hunting',
    'Your Name.',
    '3 Idiots',
    "Singin' in the Rain",
    'Requiem for a Dream',
    'Toy Story 3',
    'High and Low',
    'Capernaum',
    'Star Wars: Episode VI - Return of the Jedi',
    'Eternal Sunshine of the Spotless Mind',
    '2001: A Space Odyssey',
    'Reservoir Dogs',
    'Come and See',
    'The Hunt',
    'Citizen Kane',
    'M',
    'Lawrence of Arabia',
    'North by Northwest',
    'Vertigo',
    'Ikiru',
    'Amélie',
    'The Apartment',
    'A Clockwork Orange',
    'Double Indemnity',
    'Full Metal Jacket',
    'Top Gun: Maverick',
    'Scarface',
    'Hamilton',
    'Incendies',
    'To Kill a Mockingbird',
    'Heat',
    'The Sting',
    'Up',
    'A Separation',
    'Metropolis',
    'Taxi Driver',
    'L.A. Confidential',
    'Die Hard',
    'Snatch',
    'Indiana Jones and the Last Crusade',
    'Bicycle Thieves',
    'Like Stars on Earth',
    '1917',
    'Downfall',
    'Dangal',
    'For a Few Dollars More',
    'Batman Begins',
    'The Kid',
    'Some Like It Hot',
    'The Father',
    'All About Eve',
    'The Wolf of Wall Street',
    'Green Book',
    'Judgment at Nuremberg',
    'Casino',
    'Ran',
    "Pan's Labyrinth",
    'The Truman Show',
    'There Will Be Blood',
    'Unforgiven',
    'The Sixth Sense',
    'Shutter Island',
    'A Beautiful Mind',
    'Jurassic Park',
    'Yojimbo',
    'The Treasure of the Sierra Madre',
    'Monty Python and the Holy Grail',
    'The Great Escape',
    'No Country for Old Men',
    'Spider-Man: No Way Home',
    'Kill Bill: Vol. 1',
    'Rashomon',
    'The Thing',
    'Finding Nemo',
    'The Elephant Man',
    'Chinatown',
    'Raging Bull',
    'V for Vendetta',
    'Gone with the Wind',
    'Lock, Stock and Two Smoking Barrels',
    'Inside Out',
    'Dial M for Murder',
    'The Secret in Their Eyes',
    "Howl's Moving Castle",
    'Three Billboards Outside Ebbing, Missouri',
    'The Bridge on the River Kwai',
    'Trainspotting',
    'Prisoners',
    'Warrior',
    'Fargo',
    'Gran Torino',
    'My Neighbor Totoro',
    'Catch Me If You Can',
    'Million Dollar Baby',
    'Children of Heaven',
    'Blade Runner',
    'The Gold Rush',
    'Before Sunrise',
    '12 Years a Slave',
    'Klaus',
    'Harry Potter and the Deathly Hallows: Part 2',
    'On the Waterfront',
    'Ben-Hur',
    'Gone Girl',
    'The Grand Budapest Hotel',
    'Wild Strawberries',
    'The General',
    'The Third Man',
    'In the Name of the Father',
    'The Deer Hunter',
    'Barry Lyndon',
    'Hacksaw Ridge',
    'The Wages of Fear',
    'Memories of Murder',
    'Sherlock Jr.',
    'Wild Tales',
    'Mr. Smith Goes to Washington',
    'Mad Max: Fury Road',
    'The Seventh Seal',
    'Mary and Max',
    'How to Train Your Dragon',
    'Room',
    'Monsters, Inc.',
    'Jaws',
    'Dead Poets Society',
    'The Big Lebowski',
    'Tokyo Story',
    'The Passion of Joan of Arc',
    'Hotel Rwanda',
    'Ford v Ferrari',
    'Rocky',
    'Platoon',
    'Ratatouille',
    'Spotlight',
    'The Terminator',
    'Logan',
    'Stand by Me',
    'Rush',
    'Network',
    'Into the Wild',
    'Before Sunset',
    'The Wizard of Oz',
    'Pather Panchali',
    'Groundhog Day',
    'The Best Years of Our Lives',
    'The Exorcist',
    'The Incredibles',
    'To Be or Not to Be',
    'La haine',
    'The Battle of Algiers',
    'Pirates of the Caribbean: The Curse of the Black Pearl',
    "Hachi: A Dog's Tale",
    'The Grapes of Wrath',
    'Jai Bhim',
    'My Father and My Son',
    'Amores Perros',
    'Rebecca',
    'Cool Hand Luke',
    'The Handmaiden',
    'The 400 Blows',
    'The Sound of Music',
    'It Happened One Night',
    'Persona',
    'Life of Brian',
    'The Iron Giant',
    'The Help',
    'Dersu Uzala',
    'Aladdin',
    'Gandhi',
    'Dances with Wolves'];

async function getMovieReviews(page, movieTitle) {
    try {
        // Search for the movie
        await page.goto(`https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });

        // Get first search result
        page.locator('.ipc-metadata-list-summary-item__t').first().click();

        // Go to user reviews
        await page.getByRole('link', { name: 'User reviews' }).first().click();
        await page.waitForSelector('.review-container', { timeout: 60000 });

        // Collect reviews
        const reviews = [];
        const reviewElements = await page.locator('.review-container').all();
        
        for (const review of reviewElements.slice(0, 10)) {
            // Handle spoilers
            const spoilerButton = review.locator('.spoiler-warning__control');
            if (await spoilerButton.count() > 0) {
                await spoilerButton.click();
                await page.waitForTimeout(500);
            }
            
            // Extract text
            const text = await review.locator('.content').textContent();
            reviews.push(text.trim());
        }

        return reviews;
    } catch (error) {
        console.error(`Failed to get reviews for ${movieTitle}: ${error.message}`);
        return [];
    }
}

async function main() {
    const browser = await pw.chromium.connectOverCDP(SBR_CDP);
    const page = await browser.newPage();
    const allReviews = {};

    try {
        for (const movieTitle of moviesDataset) {
            await retry(async () => {
                console.log(`Processing: ${movieTitle}`);
                const reviews = await getMovieReviews(page, movieTitle);
                allReviews[movieTitle] = reviews;
                console.log(`Found ${reviews.length} reviews for ${movieTitle}`);
                
                // Add delay between requests
                await page.waitForTimeout(5000 + Math.random() * 5000);
            }, {
                retries: 3,
                onRetry: (e) => console.log(`Retrying ${movieTitle}: ${e.message}`)
            });
        }
        
        console.log("All reviews collected:", allReviews);
        // Save to file or process further

    } catch (err) {
        console.error('Critical error:', err);
    } finally {
        await browser.close();
    }
}

await main();
