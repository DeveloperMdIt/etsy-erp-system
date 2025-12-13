import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication middleware
router.use(authenticateToken);

// GET /api/shipping-methods - List all methods for tenant
router.get('/', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

        const methods = await prisma.shippingMethod.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });

        res.json(methods);
    } catch (error: any) {
        console.error('List Shipping Methods Error:', error);
        res.status(500).json({ error: 'Failed to list shipping methods' });
    }
});

// POST /api/shipping-methods - Create new method
router.post('/', async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        if (!user || !user.tenantId || !user.userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, provider, productCode, billingNumber, isActive } = req.body;

        // Basic validation
        if (!name || !provider || !productCode) {
            return res.status(400).json({ error: 'Name, Provider, and Product Code are required' });
        }

        const method = await prisma.shippingMethod.create({
            data: {
                tenantId: user.tenantId,
                userId: user.userId!, // Ensure linked to user if needed, or just tenant
                name,
                provider,
                productCode,
                billingNumber,
                isActive: isActive ?? true
            }
        });

        res.json(method);
    } catch (error: any) {
        console.error('Create Shipping Method Error:', error);
        res.status(500).json({ error: 'Failed to create shipping method' });
    }
});

// PUT /api/shipping-methods/:id - Update method
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        const { id } = req.params;
        const { name, provider, productCode, billingNumber, isActive } = req.body;

        const method = await prisma.shippingMethod.findFirst({
            where: { id, tenantId }
        });

        if (!method) return res.status(404).json({ error: 'Shipping Method not found' });

        const updated = await prisma.shippingMethod.update({
            where: { id },
            data: {
                name,
                provider,
                productCode,
                billingNumber,
                isActive
            }
        });

        res.json(updated);
    } catch (error: any) {
        console.error('Update Shipping Method Error:', error);
        res.status(500).json({ error: 'Failed to update shipping method' });
    }
});

// DELETE /api/shipping-methods/:id - Delete method
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        const { id } = req.params;

        const method = await prisma.shippingMethod.findFirst({
            where: { id, tenantId }
        });

        if (!method) return res.status(404).json({ error: 'Shipping Method not found' });

        await prisma.shippingMethod.delete({
            where: { id }
        });

        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete Shipping Method Error:', error);
        res.status(500).json({ error: 'Failed to delete shipping method' });
    }
});

export default router;
