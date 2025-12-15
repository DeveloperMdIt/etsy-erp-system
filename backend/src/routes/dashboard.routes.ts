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
        // Count open paid orders
        const openOrdersCount = await prisma.order.count({
            where: {
                tenantId, // Use tenantId
                status: 'OPEN', // Use enum value 'OPEN' directly or string if safe. 'financialStatus' does not exist on Order in schema shown!
                // Wait, schema shows `status OrderStatus @default(OPEN)`. 
                // It does NOT show financialStatus or fulfillmentStatus.
                // It seems checking existing code or OrderStatus enum is key.
                // OrderStatus enum: OPEN, IN_PROGRESS, SHIPPED, CANCELLED.
                // My previous code used financialStatus='PAID'. Ideally we want "open and paid".
                // But schema only has `status`.
                // Let's rely on `status: 'OPEN'` for now as "Too Do".
                // If I need paid status, I need to check if schema is missing fields or if it's implicit.
                // Schema shows `shippingCost`, `totalPrice`, etc. No `financialStatus`.
                // So I will just use `status: 'OPEN'`.
            }
        });

        const totalOrdersCount = await prisma.order.count({ where: { tenantId } });

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
                // financialStatus: 'PAID' // Removed as it doesn't exist
                status: {
                    not: 'CANCELLED' // Count everything not cancelled? Or just SHIPPED/OPEN?
                    // Let's assume all non-cancelled orders count towards revenue for now.
                }
            },
            _sum: {
                totalPrice: true // Correct field name
            }
        });

        // 4. Recent Errors
        const recentErrors = await prisma.activityLog.findMany({ // Correct model name
            where: {
                tenantId, // Use tenantId for logs? Or userId? Schema has both.
                type: 'ERROR'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
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
                totalOrders: totalOrdersCount
            },
            revenue: chartData,
            recentErrors
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

export default router;
