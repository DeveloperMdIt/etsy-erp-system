import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
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
router.get('/', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const where: any = {
            tenantId: tenantId
        };

        // Add search filter if provided
        if (search && typeof search === 'string') {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { customerNumber: { contains: search } }
            ];
        }

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { [sortBy as string]: sortOrder as any },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        res.json(customers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

/**
 * GET /api/customers/:id
 * Get customer details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const customer = await prisma.customer.findFirst({
            where: {
                id,
                tenantId: tenantId
            },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const data = createCustomerSchema.parse(req.body);

        // Check if customer already exists for this tenant
        const existing = await prisma.customer.findFirst({
            where: {
                email: data.email,
                tenantId: tenantId
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Customer with this email already exists' });
        }


        // Generate customer number
        const customerNumber = `KD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const customer = await prisma.customer.create({
            data: {
                ...data,
                tenantId: tenantId,
                customerNumber
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

/**
 * PATCH /api/customers/:id
 * Update customer information
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Allow partial updates - all fields optional
        // Allow partial updates - all fields optional, allow nulls
        const updateSchema = z.object({
            firstName: z.string().optional().nullable(),
            lastName: z.string().optional().nullable(),
            email: z.string().email().optional().nullable().or(z.literal('')),
            street: z.string().optional().nullable(),
            addressAddition: z.string().optional().nullable(),
            postalCode: z.string().optional().nullable(),
            city: z.string().optional().nullable(),
            country: z.string().optional().nullable()
        });

        const data = updateSchema.parse(req.body);

        // Verify customer belongs to tenant
        const existing = await prisma.customer.findFirst({
            where: {
                id,
                tenantId: tenantId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Prepare update data - remove nulls for required fields
        const updateData: any = { ...data };

        // Required fields cannot be null in DB
        const requiredFields = ['firstName', 'lastName', 'email', 'street', 'postalCode', 'city', 'country'];
        requiredFields.forEach(field => {
            if (updateData[field] === null) {
                delete updateData[field];
            }
        });

        // Handle empty email specifically (treat as undefined/do not update)
        if (updateData.email === '') {
            delete updateData.email;
        }

        const customer = await prisma.customer.update({
            where: { id },
            data: updateData
        });

        res.json(customer);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Validation error details:', JSON.stringify(error.errors, null, 2));
            console.error('Request body:', req.body);
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

export default router;
