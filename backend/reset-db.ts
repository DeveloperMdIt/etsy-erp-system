
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Deleting OrderItems...');
        await prisma.orderItem.deleteMany({});

        console.log('Deleting Orders...');
        await prisma.order.deleteMany({});

        console.log('Deleting Products...');
        await prisma.product.deleteMany({});

        console.log('Deleting Customers...');
        await prisma.customer.deleteMany({});

        console.log('Deleting UserSettings...');
        await prisma.userSettings.deleteMany({});

        console.log('Deleting Users...');
        await prisma.user.deleteMany({});

        console.log('Database wiped successfully.');
    } catch (error) {
        console.error('Error wiping database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
