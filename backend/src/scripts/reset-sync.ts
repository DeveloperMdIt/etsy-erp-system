
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting sync status for orders with tracking numbers...');

    // Find count first
    const count = await prisma.order.count({
        where: {
            platform: 'ETSY',
            trackingNumber: { not: null },
            // isSyncedToEtsy is currently true (default), we want to set it to false
        }
    });

    console.log(`Found ${count} orders with tracking numbers.`);

    const result = await prisma.order.updateMany({
        where: {
            platform: 'ETSY',
            trackingNumber: { not: null }
        },
        data: {
            isSyncedToEtsy: false
        }
    });

    console.log(`Updated ${result.count} orders. They will be synced on next run.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
