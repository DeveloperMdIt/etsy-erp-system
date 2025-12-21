
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Starting cleanup of Orders and Customers...');

    // 1. Delete all Orders (and related items/docs due to cascade usually, but distinct delete is safer)
    // Deleting orders first
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ Deleted ${deletedOrders.count} Orders.`);

    // 2. Delete all Customers
    // Note: If you have other data linked to customers, check constraints.
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`✅ Deleted ${deletedCustomers.count} Customers.`);

    // 3. Optional: Reset Import History
    const deletedHistory = await prisma.importHistory.deleteMany({});
    console.log(`✅ Deleted ${deletedHistory.count} Import History entries.`);

    // 4. Reset Activity Logs (Optional, but good for "Clean Slate")
    // const deletedLogs = await prisma.activityLog.deleteMany({});
    // console.log(`✅ Deleted ${deletedLogs.count} Activity Logs.`);

    console.log('✨ Database clean (Orders/Customers). Ready for fresh Sync.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
