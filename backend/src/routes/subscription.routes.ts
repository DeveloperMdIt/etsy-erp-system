import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { ActivityLogService, LogType, LogAction } from '../services/activity-log.service';

const router = Router();
const prisma = new PrismaClient();

// GET /api/subscription/modules - List all available modules
router.get('/modules', async (req: Request, res: Response) => {
    try {
        const modules = await prisma.module.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET /api/subscription/my-modules - List user's booked modules
router.get('/my-modules', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const myModules = await prisma.userModule.findMany({
            where: { userId, isActive: true },
            include: { module: true }
        });
        res.json(myModules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user modules' });
    }
});

// POST /api/subscription/book - Book a module
router.post('/book', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { moduleId } = req.body;

        if (!moduleId) {
            return res.status(400).json({ error: 'Module ID required' });
        }

        // Check if already booked
        const existing = await prisma.userModule.findFirst({
            where: { userId, moduleId, isActive: true }
        });

        if (existing) {
            return res.status(400).json({ error: 'Module already active' });
        }

        // Auto-Activation (Invoice/Beta Mode)
        const userModule = await prisma.userModule.create({
            data: {
                userId,
                moduleId,
                isActive: true, // Immediate activation
            }
        });

        // Log Activity
        await ActivityLogService.log(
            LogType.SUCCESS,
            LogAction.SUBSCRIPTION_MODULE_BOOKED,
            `Modul gebucht: ${moduleId}`,
            userId,
            (req as any).user.tenantId,
            { moduleId, method: 'INVOICE' }
        );

        res.json({ message: 'Module booked successfully', userModule });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to book module' });
    }
});

// POST /api/subscription/book-plan
router.post('/book-plan', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { planId } = req.body;
        const userId = (req as any).user.userId;

        if (!planId) {
            return res.status(400).json({ error: 'Plan ID is required' });
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionPlanId: planId,
                subscriptionStatus: 'ACTIVE',
            }
        });

        // Log Activity
        await ActivityLogService.log(
            LogType.SUCCESS,
            LogAction.SUBSCRIPTION_PLAN_CHANGED,
            `Abo-Plan gewechselt zu: ${plan.name}`,
            userId,
            (req as any).user.tenantId,
            { planId, planName: plan.name, method: 'INVOICE' }
        );

        res.json({ success: true, message: `Plan ${plan.name} booked successfully` });

    } catch (error) {
        console.error('Book plan error', error);
        res.status(500).json({ error: 'Failed to book plan' });
    }
});

export default router;
