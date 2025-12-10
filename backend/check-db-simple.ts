
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- SIMPLE DB CHECK ---');

        const users = await prisma.user.findMany();
        console.log(`Users Found: ${users.length}`);
        users.forEach(u => console.log(` - User: ${u.email}, ID: ${u.id}, Tenant: ${u.tenantId}`));

        const products = await prisma.product.findMany();
        console.log(`Products Found: ${products.length}`);
        products.forEach(p => console.log(` - Product SKU: ${p.sku}, Tenant: ${p.tenantId}`));

        const orders = await prisma.order.findMany();
        console.log(`Orders Found: ${orders.length}`);
        orders.forEach(o => console.log(` - Order #: ${o.orderNumber}, Tenant: ${o.tenantId}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
