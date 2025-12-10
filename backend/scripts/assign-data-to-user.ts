import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignDataToUser() {
    try {
        // Get the first (and probably only) user
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                shopName: true,
            },
        });

        if (!user) {
            console.error('❌ No user found! Please register first.');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.email} (${user.firstName} ${user.lastName})`);
        console.log(`   Shop: ${user.shopName || 'N/A'}`);
        console.log(`   User ID: ${user.id}\n`);

        // Check current data counts
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        const customerCount = await prisma.customer.count();

        console.log(`📊 Current data:`);
        console.log(`   Products: ${productCount}`);
        console.log(`   Orders: ${orderCount}`);
        console.log(`   Customers: ${customerCount}\n`);

        if (productCount === 0 && orderCount === 0 && customerCount === 0) {
            console.log('ℹ️  No data to assign. Database is empty.');
            process.exit(0);
        }

        // Assign all products to the user
        const productsUpdated = await prisma.product.updateMany({
            data: {
                userId: user.id,
            },
        });

        // Assign all orders to the user
        const ordersUpdated = await prisma.order.updateMany({
            data: {
                userId: user.id,
            },
        });

        // Assign all customers to the user
        const customersUpdated = await prisma.customer.updateMany({
            data: {
                userId: user.id,
            },
        });

        console.log(`✅ Data assigned successfully!`);
        console.log(`   ${productsUpdated.count} products`);
        console.log(`   ${ordersUpdated.count} orders`);
        console.log(`   ${customersUpdated.count} customers`);
        console.log(`\n🎉 All done! You can now login and see your data.`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

assignDataToUser();
