
const chain = 'solana';
const address = 'So11111111111111111111111111111111111111112'; // SOL native mint
const targetToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC

async function testMeta() {
    console.log(`\n--- Testing Meta for ${chain}/${address} ---`);
    try {
        const start = Date.now();
        const res = await fetch(`http://localhost:3000/api/token/${chain}/${address}/meta`);
        const data = await res.json();
        console.log(`Response received in ${Date.now() - start}ms:`, JSON.stringify(data, null, 2).slice(0, 300) + '...');
    } catch (err) {
        console.error('Error fetching meta:', err);
    }
}

async function testQuote() {
    console.log(`\n--- Testing Quote for ${chain}: SOL -> USDC ---`);
    try {
        const start = Date.now();
        const res = await fetch(`http://localhost:3000/api/trade/quote?chain=${chain}&from=SOL&to=${targetToken}&amount=0.1`);
        const data = await res.json();
        console.log(`Response received in ${Date.now() - start}ms:`, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error fetching quote:', err);
    }
}

async function run() {
    await testMeta();
    await testQuote();
}

run();
