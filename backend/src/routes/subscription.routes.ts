import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

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

        // Mock Payment / Activation
        const userModule = await prisma.userModule.create({
            data: {
                userId,
                moduleId,
                isActive: true,
                // expiresAt: new Date(...) // dynamic logic later
            }
        });

        res.json({ message: 'Module booked successfully', userModule });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to book module' });
    }
});

export default router;
