
import * as dotenv from 'dotenv';
// Explicitly load .env from current directory
dotenv.config();

import axios from 'axios';

async function test() {
    console.log('--- DHL Debug Start ---');
    console.log('Current Directory:', process.cwd());

    // Check ENV
    const apiKey = process.env.DHL_API_KEY;
    const apiSecret = process.env.DHL_API_SECRET;
    const env = process.env.DHL_API_ENVIRONMENT;

    console.log(`DHL_API_ENVIRONMENT config: ${env} (Defaulting to sandbox if empty)`);

    if (!apiKey) console.error('CRITICAL: DHL_API_KEY is missing in process.env');
    else console.log(`DHL_API_KEY is SET (Length: ${apiKey.length})`);

    if (!apiSecret) console.error('CRITICAL: DHL_API_SECRET is missing in process.env');
    else console.log(`DHL_API_SECRET is SET (Length: ${apiSecret.length})`);

    // Force sandbox for this test just to be sure
    const baseUrl = 'https://api-sandbox.dhl.com/parcel/de/account/auth/ropc/v1/token';
    const gkpUser = 'user-valid';
    const gkpPass = 'SandboxPasswort2023!';

    console.log(`\nTesting Connection to: ${baseUrl}`);
    console.log(`Using GKP User: ${gkpUser}`);

    if (!apiKey || !apiSecret) {
        console.error('Cannot proceed without API Key/Secret.');
        return;
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('username', gkpUser);
        params.append('password', gkpPass);
        params.append('client_id', apiKey);
        params.append('client_secret', apiSecret);

        console.log('Sending request...');
        const response = await axios.post(baseUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Token Type:', response.data.token_type);
        console.log('Expires In:', response.data.expires_in);
    } catch (error: any) {
        console.error('\n❌ FAILURE (Body Params)');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }

    // TEST 2: Basic Auth
    console.log('\n--- TEST 2: Basic Auth Header ---');
    try {
        const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const paramsBasic = new URLSearchParams();
        paramsBasic.append('grant_type', 'password');
        paramsBasic.append('username', gkpUser);
        paramsBasic.append('password', gkpPass);

        const response = await axios.post(baseUrl, paramsBasic, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`
            }
        });

        console.log('✅ SUCCESS (Basic Auth)!');
        console.log('Token Type:', response.data.token_type);
    } catch (error: any) {
        console.error('❌ FAILURE (Basic Auth)');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // TEST 3: Client Credentials (just to check App Key)
    console.log('\n--- TEST 3: Client Credentials ---');
    try {
        const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const paramsCC = new URLSearchParams();
        paramsCC.append('grant_type', 'client_credentials');

        const response = await axios.post(baseUrl, paramsCC, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`
            }
        });

        console.log('✅ SUCCESS (Client Credentials)!');
        console.log('Token Type:', response.data.token_type);
    } catch (error: any) {
        console.error('❌ FAILURE (Client Credentials)');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }

    console.log('--- DHL Debug End ---');
}

test();
