
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('WARNING: This will delete ALL orders, products, customers, and Etsy connections.');
    console.log('Starting cleanup...');

    // Delete in order of dependencies (child first)
    await prisma.orderItem.deleteMany({});
    console.log('Deleted OrderItems');

    await prisma.shippingLabel.deleteMany({});
    console.log('Deleted ShippingLabels');

    await prisma.document.deleteMany({});
    console.log('Deleted Documents');

    await prisma.order.deleteMany({});
    console.log('Deleted Orders');

    await prisma.product_variations.deleteMany({});
    console.log('Deleted Product Variations');

    await prisma.product.deleteMany({});
    console.log('Deleted Products');

    await prisma.customer.deleteMany({});
    console.log('Deleted Customers');

    await prisma.importHistory.deleteMany({});
    console.log('Deleted ImportHistory');

    await prisma.activityLog.deleteMany({});
    console.log('Deleted ActivityLogs');

    // Optional: Clear Etsy Tokens to force reconnect
    // await prisma.etsyToken.deleteMany({});
    // console.log('Deleted EtsyTokens');

    console.log('Database cleanup completed. Users and Settings were preserved.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
