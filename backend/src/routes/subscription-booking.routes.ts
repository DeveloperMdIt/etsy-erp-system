import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

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

        // Update User
        // Note: For now we just update immediately. In real world: Payment Gateway (Stripe/PayPal) checkout here.
        // If price > 0, we might want to set status to PENDING_PAYMENT or similar.
        // User requested "Booking", implying instant change for now or manual invoice? 
        // "Free" or "Trial" -> Active immediately.

        // If switching from Trial -> Paid: Cancel trial info? Or keep it?
        // Usually: Trial ends, Paid starts.

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionPlanId: planId,
                subscriptionStatus: 'ACTIVE', // Assume active if booked
                // If we want to keep trial running if they upgrade early? Usually update immediately.
                // trialEndsAt: null // Remove trial if they commit to a plan?
            }
        });

        res.json({ success: true, message: `Plan ${plan.name} booked successfully` });

    } catch (error) {
        console.error('Book plan error', error);
        res.status(500).json({ error: 'Failed to book plan' });
    }
});

export default router;
