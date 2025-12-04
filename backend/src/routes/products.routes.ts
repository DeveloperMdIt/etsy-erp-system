import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schema
const createProductSchema = z.object({
    sku: z.string(),
    gtin: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    weight: z.number().int().min(0), // grams
    price: z.number().min(0)
});

/**
 * GET /api/products
 * Get all products for the current tenant
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const { search } = req.query;

        const where: any = {
            tenantId: req.user!.tenantId
        };

        // Add search filter if provided
        if (search && typeof search === 'string') {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { gtin: { contains: search, mode: 'insensitive' } }
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * GET /api/products/:id
 * Get product details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findFirst({
            where: {
                id,
                tenantId: req.user!.tenantId
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = createProductSchema.parse(req.body);

        // Check if SKU already exists for this tenant
        const existing = await prisma.product.findFirst({
            where: {
                sku: data.sku,
                tenantId: req.user!.tenantId
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Product with this SKU already exists' });
        }

        const product = await prisma.product.create({
            data: {
                ...data,
                tenantId: req.user!.tenantId
            }
        });

        res.status(201).json({ product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

/**
 * PATCH /api/products/:id
 * Update a product
 */
router.patch('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const data = createProductSchema.partial().parse(req.body);

        // Verify product belongs to tenant
        const existing = await prisma.product.findFirst({
            where: {
                id,
                tenantId: req.user!.tenantId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = await prisma.product.update({
            where: { id },
            data
        });

        res.json({ product });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

export default router;
