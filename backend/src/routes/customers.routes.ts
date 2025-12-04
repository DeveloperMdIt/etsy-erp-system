import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schema
const createCustomerSchema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    street: z.string(),
    addressAddition: z.string().optional(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string().default('DE'),
    phone: z.string().optional()
});

/**
 * GET /api/customers
 * Get all customers for the current tenant
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
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        res.json({ customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

/**
 * GET /api/customers/:id
 * Get customer details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findFirst({
            where: {
                id,
                tenantId: req.user!.tenantId
            },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ customer });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const data = createCustomerSchema.parse(req.body);

        // Check if customer already exists for this tenant
        const existing = await prisma.customer.findFirst({
            where: {
                email: data.email,
                tenantId: req.user!.tenantId
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Customer with this email already exists' });
        }

        // Check if this email has ordered before (repeat customer)
        const previousCustomer = await prisma.customer.findFirst({
            where: {
                email: data.email,
                tenantId: req.user!.tenantId
            }
        });

        const customer = await prisma.customer.create({
            data: {
                ...data,
                tenantId: req.user!.tenantId,
                isRepeatCustomer: !!previousCustomer
            }
        });

        res.status(201).json({ customer });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

export default router;
