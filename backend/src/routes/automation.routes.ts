import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AutomationService, AutomationTrigger } from '../services/automation.service';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

// GET /api/automation/rules - List all rules
router.get('/rules', async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const tenantId = (req as AuthRequest).user?.tenantId;

        if (!userId || !tenantId) return res.status(401).json({ error: 'Auth required' });

        const rules = await prisma.automationRule.findMany({
            where: { tenantId },
            orderBy: { priority: 'desc' }
        });

        res.json(rules);
    } catch (error) {
        console.error('Get rules error:', error);
        res.status(500).json({ error: 'Failed to fetch rules' });
    }
});

// POST /api/automation/rules - Create new rule
router.post('/rules', async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!userId || !tenantId) return res.status(401).json({ error: 'Auth required' });

        const { name, trigger, conditions, actions, isActive, priority } = req.body;

        const rule = await prisma.automationRule.create({
            data: {
                tenantId,
                userId,
                name,
                trigger,
                conditions: JSON.stringify(conditions || []),
                actions: JSON.stringify(actions || []),
                isActive: isActive ?? true,
                priority: priority || 0
            }
        });

        res.json(rule);
    } catch (error) {
        console.error('Create rule error:', error);
        res.status(500).json({ error: 'Failed to create rule' });
    }
});

// PUT /api/automation/rules/:id - Update rule
router.put('/rules/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user?.userId;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!userId || !tenantId) return res.status(401).json({ error: 'Auth required' });

        const { name, trigger, conditions, actions, isActive, priority } = req.body;

        const rule = await prisma.automationRule.update({
            where: { id, tenantId }, // Ensure tenant isolation
            data: {
                name,
                trigger,
                conditions: typeof conditions === 'string' ? conditions : JSON.stringify(conditions),
                actions: typeof actions === 'string' ? actions : JSON.stringify(actions),
                isActive,
                priority
            }
        });

        res.json(rule);
    } catch (error) {
        console.error('Update rule error:', error);
        res.status(500).json({ error: 'Failed to update rule' });
    }
});

// DELETE /api/automation/rules/:id - Delete rule
router.delete('/rules/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Auth required' });

        await prisma.automationRule.delete({
            where: { id, tenantId }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete rule error:', error);
        res.status(500).json({ error: 'Failed to delete rule' });
    }
});

// GET /api/automation/triggers - List available triggers
router.get('/triggers', (req: Request, res: Response) => {
    res.json(Object.values(AutomationTrigger));
});

export default router;
