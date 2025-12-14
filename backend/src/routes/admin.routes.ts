import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { EmailService } from '../services/email.service';

const router = Router();
const prisma = new PrismaClient();

// Apply admin check to all routes
router.use(authenticateToken as any, requireAdmin as any);

// ==========================================
// USER MANAGEMENT
// ==========================================

// GET /api/admin/users - List users with basic stats
router.get('/users', async (req: Request, res: Response) => {
    try {
        // Fetch all users
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group order counts by tenantId
        const orderCounts = await prisma.order.groupBy({
            by: ['tenantId'],
            _count: {
                id: true
            }
        });

        // Create a map for quick lookup: tenantId -> count
        const orderCountMap = new Map();
        orderCounts.forEach(item => {
            orderCountMap.set(item.tenantId, item._count.id);
        });

        const userList = users.map((u: any) => ({
            id: u.id,
            email: u.email,
            shopName: u.shopName,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            isBlocked: u.isBlocked,
            createdAt: u.createdAt,
            orderCount: orderCountMap.get(u.tenantId) || 0, // Get count from map
            productCount: u._count?.products || 0,
        }));

        res.json(userList);
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/admin/users/:id/block - Block/Unblock user
router.post('/users/:id/block', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { isBlocked }
        });

        res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'}`, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user block status' });
    }
});


// ==========================================
// MODULE MANAGEMENT
// ==========================================

// GET /api/admin/modules
router.get('/modules', async (req: Request, res: Response) => {
    try {
        const modules = await prisma.module.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// POST /api/admin/modules - Create module
router.post('/modules', async (req: Request, res: Response) => {
    try {
        const { key, name, description, price, isActive, isPlanned, category } = req.body;
        const module = await prisma.module.create({
            data: { key, name, description, price, isActive, isPlanned, category }
        });
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create module' });
    }
});

// PUT /api/admin/modules/:id - Update module
router.put('/modules/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, isActive, isPlanned, category } = req.body;
        const module = await prisma.module.update({
            where: { id },
            data: { name, description, price, isActive, isPlanned, category }
        });
        res.json(module);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// DELETE /api/admin/modules/:id
router.delete('/modules/:id', async (req: Request, res: Response) => {
    try {
        await prisma.module.delete({ where: { id: req.params.id } });
        res.json({ message: 'Module deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete module' });
    }
});


// ==========================================
// SYSTEM SETTINGS (GLOBAL KEYS)
// ==========================================

router.get('/settings', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/settings', async (req: Request, res: Response) => {
    try {
        const { settings } = req.body; // Expect array of { key, value }

        const updates = settings.map((s: any) =>
            prisma.systemSetting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: { key: s.key, value: s.value }
            })
        );

        await prisma.$transaction(updates);
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});


// ==========================================
// CONTENT MANAGEMENT (CMS)
// ==========================================

router.get('/content', async (req: Request, res: Response) => {
    try {
        const pages = await prisma.contentPage.findMany();
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content pages' });
    }
});

router.put('/content/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { title, content, isPublished } = req.body;

        const page = await prisma.contentPage.upsert({
            where: { slug },
            update: { title, content, isPublished },
            create: { slug, title, content, isPublished }
        });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save content page' });
    }
});


// ==========================================
// EMAIL TESTING
// ==========================================

router.post('/emails/test', async (req: Request, res: Response) => {
    try {
        const { recipient, subject, content } = req.body;

        if (!recipient || !subject || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await EmailService.sendMail(recipient, subject, content);

        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Test Email Error:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});


export default router;
