import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const tenantId = (req as AuthRequest).user?.tenantId;

        if (!userId || !tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Setup Status
        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        // Check if we have any shipping methods
        const shippingMethodsCount = await prisma.shippingProfile.count({
            where: { userId }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                etsyAccessToken: true, // Correct field name
                shopName: true
            }
        });

        const setupStatus = {
            hasSettings: !!settings,
            hasShop: !!user?.shopName,
            hasEtsy: !!user?.etsyAccessToken,
            hasShipping: shippingMethodsCount > 0,
            hasLayout: !!settings?.printerInvoice
        };

        // 2. Action Items / Stats

        // Open Orders
        const openOrdersCount = await prisma.order.count({
            where: {
                tenantId,
                status: 'OPEN'
            }
        });

        // Products Count
        const productsCount = await prisma.product.count({
            where: { tenantId }
        });

        // Packages Sent (Status SHIPPED)
        const packagesSent = await prisma.order.count({
            where: {
                tenantId,
                status: 'SHIPPED'
            }
        });

        // Revenue Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const revenueTodayAgg = await prisma.order.aggregate({
            where: {
                tenantId,
                createdAt: { gte: startOfDay },
                status: { not: 'CANCELLED' }
            },
            _sum: {
                totalPrice: true
            }
        });
        const revenueToday = revenueTodayAgg._sum.totalPrice || 0;

        // Recent Orders
        const recentOrders = await prisma.order.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                customer: true // Include customer to show name
            }
        });

        // 3. Revenue (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                tenantId,
                createdAt: {
                    gte: thirtyDaysAgo
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            _sum: {
                totalPrice: true
            }
        });

        // Process revenue data
        const dailyRevenue = new Map<string, number>();
        revenueData.forEach(item => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            const amount = item._sum.totalPrice || 0;
            dailyRevenue.set(dateStr, (dailyRevenue.get(dateStr) || 0) + amount);
        });

        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            chartData.push({
                date: dateStr,
                amount: dailyRevenue.get(dateStr) || 0
            });
        }

        res.json({
            setupStatus,
            stats: {
                openOrders: openOrdersCount,
                revenueToday: revenueToday,
                productsCount: productsCount,
                packagesSent: packagesSent
            },
            recentOrders: recentOrders, // Top level recent orders
            revenue: chartData
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

export default router;
