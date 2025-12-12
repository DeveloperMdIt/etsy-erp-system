
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTokens() {
    try {
        console.log('Checking User Tokens...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                shopName: true,
                etsyShopId: true,
                // We select these to see if they exist/are populated
                // Note: If Prisma Client is stale, this MIGHT fail to select if it doesn't know the field.
                // But let's try.
                etsyAccessToken: true,
                etsyRefreshToken: true,
                tokenExpiresAt: true
            }
        });

        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(u => {
                console.log(`User: ${u.email}`);
                console.log(`  Shop Name: ${u.shopName}`);
                console.log(`  Etsy Shop ID: ${u.etsyShopId}`);
                console.log(`  Access Token Present: ${!!u.etsyAccessToken}`);
                console.log(`  Refresh Token Present: ${!!u.etsyRefreshToken}`);
                console.log(`  Expires At: ${u.tokenExpiresAt}`);
                console.log('---');
            });
        }
    } catch (e) {
        console.error('Error querying users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkTokens();
