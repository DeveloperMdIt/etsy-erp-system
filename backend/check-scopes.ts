import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const ETSY_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';

async function checkScopes() {
    try {
        // Get the most recently updated user (likely the one we are using)
        const user = await prisma.user.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!user || !user.etsyAccessToken) {
            console.log('❌ No connected user found.');
            return;
        }

        console.log(`👤 Checking scopes for User: ${user.email} (Shop: ${user.shopName})`);

        // Make a lightweight call to check headers
        // /application/shops/{shop_id} is good
        const url = `https://api.etsy.com/v3/application/shops/${user.etsyShopId}`;

        const response = await axios.get(url, {
            headers: {
                'x-api-key': ETSY_KEY,
                'Authorization': `Bearer ${user.etsyAccessToken}`
            }
        });

        const scopes = response.headers['x-oauth-scopes'];
        console.log('\n🔐 DETECTED SCOPES:');
        console.log(scopes);

        if (scopes && scopes.includes('transactions_w')) {
            console.log('\n✅ SUCCESS: "transactions_w" scope is PRESENT. We can update tracking!');
        } else {
            console.log('\n⚠️ WARNING: "transactions_w" scope is MISSING. Tracking updates might fail.');
        }

    } catch (error: any) {
        console.error('❌ Error checking scopes:', error.response?.data || error.message);
        if (error.response?.headers) {
            console.log('Headers:', error.response.headers);
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkScopes();
