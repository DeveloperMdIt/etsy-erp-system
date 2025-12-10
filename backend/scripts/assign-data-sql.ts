import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignDataDirectly() {
    try {
        // Get the user
        const user = await prisma.user.findFirst();

        if (!user) {
            console.error('❌ No user found!');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.email}`);
        console.log(`   User ID: ${user.id}\n`);

        // Use raw SQL to add userId columns and assign data
        await prisma.$executeRawUnsafe(`
      -- Add userId columns if they don't exist
      ALTER TABLE products ADD COLUMN IF NOT EXISTS userId TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS userId TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS userId TEXT;
    `);

        console.log('✅ Added userId columns\n');

        // Update all records
        await prisma.$executeRawUnsafe(`UPDATE products SET userId = ?`, user.id);
        await prisma.$executeRawUnsafe(`UPDATE orders SET userId = ?`, user.id);
        await prisma.$executeRawUnsafe(`UPDATE customers SET userId = ?`, user.id);

        // Count results
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        const customerCount = await prisma.customer.count();

        console.log(`✅ Data assigned successfully!`);
        console.log(`   ${productCount} products`);
        console.log(`   ${orderCount} orders`);
        console.log(`   ${customerCount} customers`);
        console.log(`\n🎉 All done!`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

assignDataDirectly();
