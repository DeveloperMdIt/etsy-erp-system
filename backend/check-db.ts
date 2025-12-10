
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
    try {
        console.log('--- DB DIAGNOSTIC START ---');

        const userCount = await prisma.user.count();
        console.log(`Total Users: ${userCount}`);

        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { products: true, orders: true }
                }
            }
        });

        for (const u of users) {
            console.log(`User: ${u.email}`);
            console.log(`  ID: ${u.id}`);
            console.log(`  Tenant: ${u.tenantId}`);
            console.log(`  Products: ${u._count.products}`);
            console.log(`  Orders: ${u._count.orders}`);

            // Sample products
            if (u._count.products > 0) {
                const sample = await prisma.product.findFirst({ where: { userId: u.id } });
                console.log(`  Sample Product SKU: ${sample?.sku} | Name: ${sample?.name}`);
            }
        }

        console.log('--- DB DIAGNOSTIC END ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
