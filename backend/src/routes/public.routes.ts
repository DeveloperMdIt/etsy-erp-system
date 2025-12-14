import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/public/modules - List active modules for Landing Page
router.get('/modules', async (req: Request, res: Response) => {
    try {
        const modules = await prisma.module.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

// GET /api/public/content/:slug - Fetch CMS content
router.get('/content/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const page = await prisma.contentPage.findUnique({
            where: { slug }
        });

        if (!page || !page.isPublished) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

export default router;
