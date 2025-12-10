import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
    // For now we keep the list logic inline or move it to Controller later if needed.
    // The user requirement focused on Create/Update/Get(Details).
    // Let's defer List to controller for consistency? 
    // Actually, the new Controller managed Create/Update/Detail. 
    // Existing List logic is fine, but let's see. 
    // To minimize risk, I will replace the Create/Update/GetDetail routes.

    // ... EXISTING LIST LOGIC START ...
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        // Use tenantId from authenticated token
        const tenantId = req.user?.tenantId;
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
    // ... EXISTING LIST LOGIC END ...
});

// GET /api/products/:id
router.get('/:id', ProductsController.getProduct);

// POST /api/products
router.post('/', ProductsController.createProduct);

// PATCH /api/products/:id
// Standard in this app seems to be PATCH for updates.
router.patch('/:id', ProductsController.updateProduct);

/**
 * DELETE /api/products/:id
 * Deactivate a product (soft delete)
 */
router.delete('/:id', async (req, res) => {
    // Keep existing delete logic inline for now as it wasn't requested to change?
    // Or move it? Let's keep it inline to minimize diff noise unless necessary.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
        const { id } = req.params;
        const { force } = req.query;
        const tenantId = (req.headers['x-tenant-id'] as string) || 'default-tenant';

        console.log(`Delete request for product ${id}, force=${force}, type=${typeof force}`);

        // Verify product belongs to tenant
        const existing = await prisma.product.findFirst({
            where: {
                id,
                tenantId: tenantId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (String(force) === 'true') {
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
