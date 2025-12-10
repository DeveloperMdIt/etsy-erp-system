import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignData() {
    try {
        const user = await prisma.user.findFirst();

        if (!user) {
            console.error('❌ No user found!');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.email}`);
        console.log(`   User ID: ${user.id}\n`);

        // Try to add columns (might fail if they already exist, that's OK)
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE products ADD COLUMN userId TEXT`);
            console.log('✅ Added userId to products');
        } catch (e: any) {
            if (e.message.includes('duplicate column')) {
                console.log('ℹ️  userId column already exists in products');
            } else {
                throw e;
            }
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE orders ADD COLUMN userId TEXT`);
            console.log('✅ Added userId to orders');
        } catch (e: any) {
            if (e.message.includes('duplicate column')) {
                console.log('ℹ️  userId column already exists in orders');
            } else {
                throw e;
            }
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE customers ADD COLUMN userId TEXT`);
            console.log('✅ Added userId to customers\n');
        } catch (e: any) {
            if (e.message.includes('duplicate column')) {
                console.log('ℹ️  userId column already exists in customers\n');
            } else {
                throw e;
            }
        }

        // Now assign all data
        const productsResult = await prisma.$executeRawUnsafe(`UPDATE products SET userId = ? WHERE userId IS NULL`, user.id);
        const ordersResult = await prisma.$executeRawUnsafe(`UPDATE orders SET userId = ? WHERE userId IS NULL`, user.id);
        const customersResult = await prisma.$executeRawUnsafe(`UPDATE customers SET userId = ? WHERE userId IS NULL`, user.id);

        console.log(`✅ Data assigned successfully!`);
        console.log(`   Products: ${productsResult}`);
        console.log(`   Orders: ${ordersResult}`);
        console.log(`   Customers: ${customersResult}`);
        console.log(`\n🎉 All done! You can now login and see your data.`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

assignData();
