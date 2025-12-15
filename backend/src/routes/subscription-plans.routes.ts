import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// GET all plans (Public/Protected depending on use case, Admin needs all, Users need active)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { activeOnly } = req.query;

        const where: any = {};
        if (activeOnly === 'true') {
            where.isActive = true;
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where,
            orderBy: { price: 'asc' }
        });

        // Parse features JSON string to array if needed, but frontend handles string split usually?
        // Let's keep it simple and return as is, assuming frontend handles JSON.parse if it's a string
        const parsedPlans = plans.map(p => ({
            ...p,
            features: p.features ? JSON.parse(p.features) : []
        }));

        res.json(parsedPlans);
    } catch (error) {
        console.error('Get plans error', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// GET single plan
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: req.params.id }
        });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        res.json({
            ...plan,
            features: plan.features ? JSON.parse(plan.features) : []
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});

// Admin: CREATE plan
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const {
            name, description, price, interval,
            includedOrders, pricePerExtraOrder,
            features, isPopular, isActive
        } = req.body;

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                interval: interval || 'MONTHLY',
                includedOrders: parseInt(includedOrders),
                pricePerExtraOrder: parseFloat(pricePerExtraOrder),
                features: JSON.stringify(features || []),
                isPopular: isPopular || false,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.json(plan);
    } catch (error) {
        console.error('Create plan error', error);
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// Admin: UPDATE plan
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const {
            name, description, price, interval,
            includedOrders, pricePerExtraOrder,
            features, isPopular, isActive
        } = req.body;

        const plan = await prisma.subscriptionPlan.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                price: parseFloat(price),
                interval,
                includedOrders: parseInt(includedOrders),
                pricePerExtraOrder: parseFloat(pricePerExtraOrder),
                features: JSON.stringify(features || []),
                isPopular,
                isActive
            }
        });

        res.json(plan);
    } catch (error) {
        console.error('Update plan error', error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// Admin: DELETE plan
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        await prisma.subscriptionPlan.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

export default router;
