import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetEtsyTokens() {
    console.log('🧹 Starting Etsy Token Reset (Clean Slate)...');

    try {
        await prisma.user.updateMany({
            data: {
                etsyAccessToken: null,
                etsyRefreshToken: null,
                tokenExpiresAt: null,
                etsyUserId: null,
                etsyShopId: null
                // Note: Clearing shopName is optional but good for "Not Connected" UI state
            }
        });

        // Also clean UserSettings to be thorough
        await prisma.userSettings.updateMany({
            data: {
                etsyShopName: null,
                etsySyncEnabled: false
            }
        });

        console.log('✅ All Etsy tokens and IDs have been wiped from users.');
        console.log('👉 ACTION REQUIRED: Now revoke the app in your Etsy account before reconnecting!');

    } catch (error) {
        console.error('❌ Error wiping tokens:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetEtsyTokens();
