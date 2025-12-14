require('dotenv').config();
const url = process.env.DATABASE_URL;
if (!url) {
    console.log('DATABASE_URL is undefined or empty');
} else {
    console.log(`DATABASE_URL starts with: ${url.substring(0, 15)}...`);
    // Check if it has quotes
    if (url.startsWith('"') || url.startsWith("'")) {
        console.log('WARNING: URL starts with quotes!');
    }
}
