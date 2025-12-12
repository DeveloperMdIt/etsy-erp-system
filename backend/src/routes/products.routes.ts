import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ProductsController } from '../controllers/products.controller';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticateToken as any);

// GET /api/products - List all products with filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        // Use tenantId from authenticated token
        const tenantId = user?.tenantId;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID missing in token' });
        }

        const { search, status } = req.query;

        const where: any = {
            tenantId: tenantId
        };

        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }

        if (search && typeof search === 'string') {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
                { gtin: { contains: search } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get product details
router.get('/:id', ProductsController.getProduct);

// POST /api/products - Create new product
router.post('/', ProductsController.createProduct);

// PATCH /api/products/:id - Update product
router.patch('/:id', ProductsController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permanent } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        if (permanent === 'true') {
            console.log('Executing hard delete...');
            // Hard delete
            await prisma.product.delete({
                where: { id }
            });
            return res.json({ success: true, message: 'Product permanently deleted' });
        }

        console.log('Executing soft delete (deactivation)...');
        // Soft delete - set isActive to false
        await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({ success: true, message: 'Product deactivated successfully' });
    } catch (error: any) {
        console.error('Delete product error:', error);

        // Handle foreign key constraint violation (P2003)
        if (error.code === 'P2003') {
            return res.status(409).json({
                error: 'Deletion failed',
                message: 'Das Produkt kann nicht gelöscht werden, da es bereits in Bestellungen verwendet wird. Bitte deaktivieren Sie es stattdessen.'
            });
        }

        res.status(500).json({
            error: 'Failed to delete product',
            message: error.message || 'Ein unerwarteter Fehler ist aufgetreten'
        });
    }
});

export default router;
