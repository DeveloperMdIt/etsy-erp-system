import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all profiles for tenant
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId;
        const profiles = await prisma.shippingProfile.findMany({
            where: { userId },
            include: { _count: { select: { products: true } } } // Include count of linked products
        });
        res.json(profiles);
    } catch (error) {
        console.error('Fetch profiles error:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// Create profile
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId;
        const { name, provider, productCode, billingNumber, baseWeight, length, width, height } = req.body;

        const profile = await prisma.shippingProfile.create({
            data: {
                userId,
                tenantId,
                name,
                provider, // 'DHL' or 'INTERNETMARKE'
                productCode,
                billingNumber,
                baseWeight: parseFloat(baseWeight) || 0,
                length: parseFloat(length) || 0,
                width: parseFloat(width) || 0,
                height: parseFloat(height) || 0
            }
        });
        res.json(profile);
    } catch (error) {
        console.error('Create profile error:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

// Update profile
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { name, provider, productCode, billingNumber, baseWeight, length, width, height } = req.body;

        const profile = await prisma.shippingProfile.updateMany({
            where: { id, userId },
            data: {
                name,
                provider,
                productCode,
                billingNumber,
                baseWeight: parseFloat(baseWeight) || 0,
                length: parseFloat(length) || 0,
                width: parseFloat(width) || 0,
                height: parseFloat(height) || 0
            }
        });

        if (profile.count === 0) {
            return res.status(404).json({ error: 'Profile not found or access denied' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Delete profile
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        // Optional: Check if products are linked?
        // For now, allow delete, which sets product.shippingProfileId to null if defined as SetNull, 
        // or fails if Restrict.
        // Prisma default is usually SetNull for optional relations or we need to check.
        // Our schema: Product.shippingProfileId is optional.

        // But we need to handle the relation constraint if Prisma enforces foreign keys.
        // Let's first disconnect any products.
        await prisma.product.updateMany({
            where: { shippingProfileId: id, userId },
            data: { shippingProfileId: null }
        });

        const deleted = await prisma.shippingProfile.deleteMany({
            where: { id, userId }
        });

        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

export default router;
