// Test login and settings
import axios from 'axios';

async function test() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'walli@etsy',
            password: 'Euramobil1610!Etsy'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

        // 2. Get Settings
        console.log('\n2. Getting settings...');
        const settingsResponse = await axios.get('http://localhost:3001/api/settings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Settings loaded successfully!');
        console.log('Settings keys:', Object.keys(settingsResponse.data));

    } catch (error: any) {
        console.error('❌ Error:', error.response?.status, error.response?.data);
        if (error.response?.data) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('Stack:', error.stack);
    }
}

test();
