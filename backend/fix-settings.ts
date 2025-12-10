
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSettings() {
    try {
        console.log('Fixing user settings...');
        const result = await prisma.userSettings.updateMany({
            data: {
                orderNumberFormat: 'BE-{YYYY}-{####}'
            }
        });
        console.log(`Updated ${result.count} user settings to use BE- format.`);

        // Also check if we have any products/orders
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        const userCount = await prisma.user.count();

        console.log('--- DIAGNOSTICS ---');
        console.log(`Users: ${userCount}`);
        console.log(`Products: ${productCount}`);
        console.log(`Orders: ${orderCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({ include: { settings: true } });
            users.forEach(u => {
                console.log(`User: ${u.email} (Tenant: ${u.tenantId})`);
                console.log(` - Settings Format: ${u.settings?.orderNumberFormat}`);
            });
        }

    } catch (error) {
        console.error('Error fixing settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSettings();
