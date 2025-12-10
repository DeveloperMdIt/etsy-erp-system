
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    try {
        console.log('--- MERGING TENANTS ---');

        // 1. Find the most recent user (likely the one currently logged in)
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        if (users.length === 0) {
            console.log('No users found! Please register first.');
            return;
        }

        const targetUser = users[0];
        console.log(`Targeting User: ${targetUser.email} (ID: ${targetUser.id})`);
        console.log(`Target Tenant: ${targetUser.tenantId}`);

        // 2. Move Products
        const productsUpdate = await prisma.product.updateMany({
            data: {
                tenantId: targetUser.tenantId,
                userId: targetUser.id
            }
        });
        console.log(`Moved ${productsUpdate.count} products to target tenant.`);

        // 3. Move Orders
        const ordersUpdate = await prisma.order.updateMany({
            data: {
                tenantId: targetUser.tenantId,
                userId: targetUser.id
            }
        });
        console.log(`Moved ${ordersUpdate.count} orders to target tenant.`);

        // 4. Update Variations (implicitly handled by product update? No, they don't have tenantId but depend on product)
        // Check if variations need manual update? Schema says variations link to product.
        // Product variations don't have tenantId in the schema usually, let's double check.
        // I recalled from product-import that variations are found via product.

        // 5. Update UserSettings?
        // Each user has their own settings. We ensure target user has settings.
        const settings = await prisma.userSettings.findUnique({ where: { userId: targetUser.id } });
        if (!settings) {
            console.log('Creating default settings for target user...');
            await prisma.userSettings.create({
                data: {
                    userId: targetUser.id,
                    orderNumberFormat: 'BE-{YYYY}-{####}',
                    invoiceNumberFormat: 'RE-{YYYY}-{####}',
                    orderNumberCurrent: 10 // Safe buffer
                }
            });
        } else {
            // Force BE format
            await prisma.userSettings.update({
                where: { userId: targetUser.id },
                data: { orderNumberFormat: 'BE-{YYYY}-{####}' }
            });
            console.log('Enforced BE- format on target user.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
