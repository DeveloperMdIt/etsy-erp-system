
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting database reset...');

    // Delete in order to respect foreign keys
    console.log('Deleting OrderItems...');
    await prisma.orderItem.deleteMany({});

    console.log('Deleting ShippingLabels...');
    await prisma.shippingLabel.deleteMany({});

    console.log('Deleting Documents...');
    await prisma.document.deleteMany({});

    console.log('Deleting Orders...');
    await prisma.order.deleteMany({});

    console.log('Deleting ProductVariations...');
    await prisma.product_variations.deleteMany({});

    console.log('Deleting Products...');
    await prisma.product.deleteMany({});

    console.log('Deleting Customers...');
    await prisma.customer.deleteMany({});

    console.log('✅ Database reset complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
