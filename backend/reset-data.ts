import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('⚠️  STARTING FULL DATA RESET ⚠️');
    console.log('This will delete ALL Orders, Products, Customers and reset Number Ranges.');

    try {
        console.log('1. Deleting Import History...');
        await prisma.importHistory.deleteMany({});

        console.log('2. Deleting OrderItems...');
        await prisma.orderItem.deleteMany({});

        console.log('3. Deleting ShippingLabels...');
        await prisma.shippingLabel.deleteMany({});

        console.log('4. Deleting Orders...');
        await prisma.order.deleteMany({});

        console.log('5. Deleting Product Components & Variations...');
        await prisma.product_components.deleteMany({});
        await prisma.product_variations.deleteMany({});

        console.log('6. Deleting Products...');
        await prisma.product.deleteMany({});

        console.log('7. Deleting Customers...');
        await prisma.customer.deleteMany({});

        // Optional: Delete Automation Logs / Activity Logs? Maybe keep them for audit.
        // await prisma.activityLog.deleteMany({});

        console.log('8. Resetting Number Ranges in UserSettings...');
        await prisma.userSettings.updateMany({
            data: {
                orderNumberCurrent: 1,
                invoiceNumberCurrent: 1,
                deliveryNoteCurrent: 1,
                customerNumberCurrent: 1,
                supplierOrderCurrent: 1
            }
        });

        console.log('✅ Reset Complete! Database is clean for testing.');

    } catch (e) {
        console.error('❌ Reset Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
