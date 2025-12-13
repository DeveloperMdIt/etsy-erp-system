
import prisma from '../utils/prisma';

async function testDashboardLogic() {
    console.log('Starting Dashboard Logic Test...');

    // 1. Get a user to test with
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found in DB');
        return;
    }
    console.log(`Testing with user: ${user.email} (${user.id})`);
    const userId = user.id;

    try {
        // 1. Setup Status
        console.log('Checking Settings...');
        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });
        console.log('Settings found:', !!settings);

        console.log('Checking Shipping Methods...');
        const shippingMethodsCount = await prisma.shippingMethod.count({
            where: { userId }
        });
        console.log('Shipping Methods count:', shippingMethodsCount);

        // 2. Orders
        console.log('Checking Orders...');
        const openOrdersCount = await prisma.order.count({
            where: {
                userId,
                financialStatus: 'PAID',
                fulfillmentStatus: 'OPEN'
            }
        });
        console.log('Open Orders:', openOrdersCount);

        // 3. Revenue
        console.log('Checking Revenue...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                userId,
                createdAt: {
                    gte: thirtyDaysAgo
                },
                financialStatus: 'PAID'
            },
            _sum: {
                totalAmount: true
            }
        });
        console.log('Revenue Data query success. Items:', revenueData.length);

        // 4. Logs
        console.log('Checking Logs...');
        const recentErrors = await prisma.log.findMany({
            where: {
                userId,
                level: 'ERROR'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });
        console.log('Logs query success. Items:', recentErrors.length);

        console.log('TEST COMPLETED SUCCESSFULLY');

    } catch (error) {
        console.error('TEST FAILED WITH ERROR:', error);
    }
}

testDashboardLogic()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
