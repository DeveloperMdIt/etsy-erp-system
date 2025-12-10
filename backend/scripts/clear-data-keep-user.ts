import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
    try {
        console.log('🗑️  Deleting data (keeping user account)...\n');

        // Delete using raw SQL to avoid Prisma naming issues
        await prisma.$executeRawUnsafe(`DELETE FROM order_items`);
        console.log(`✅ Deleted order items`);

        await prisma.$executeRawUnsafe(`DELETE FROM shipping_labels`);
        console.log(`✅ Deleted shipping labels`);

        await prisma.$executeRawUnsafe(`DELETE FROM documents`);
        console.log(`✅ Deleted documents`);

        await prisma.$executeRawUnsafe(`DELETE FROM orders`);
        console.log(`✅ Deleted orders`);

        await prisma.$executeRawUnsafe(`DELETE FROM product_variations`);
        console.log(`✅ Deleted product variations`);

        await prisma.$executeRawUnsafe(`DELETE FROM product_components`);
        console.log(`✅ Deleted product components`);

        await prisma.$executeRawUnsafe(`DELETE FROM products`);
        console.log(`✅ Deleted products`);

        await prisma.$executeRawUnsafe(`DELETE FROM customers`);
        console.log(`✅ Deleted customers`);

        await prisma.$executeRawUnsafe(`DELETE FROM import_history`);
        console.log(`✅ Deleted import history`);

        console.log('\n🎉 All data cleared successfully!');
        console.log('👤 User account is still intact.\n');

        // Show remaining user
        const user: any = await prisma.$queryRawUnsafe(`
      SELECT email, firstName, lastName, shopName 
      FROM users 
      LIMIT 1
    `);

        if (user && user.length > 0) {
            const u = user[0];
            console.log(`✅ User still exists: ${u.email}`);
            console.log(`   Name: ${u.firstName || ''} ${u.lastName || ''}`);
            console.log(`   Shop: ${u.shopName || 'N/A'}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

clearData();
