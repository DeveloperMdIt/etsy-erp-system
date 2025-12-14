import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { OrderStatus } from '@prisma/client';
import { EtsyTrackingService } from '../services/etsy-tracking.service';

const router = Router();
const etsyTrackingService = new EtsyTrackingService();

// Apply authentication to all routes
router.use(authenticateToken as any);

// Validation schemas
const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().min(0)
});

const createOrderSchema = z.object({
    customerId: z.string(),
    externalOrderId: z.string().optional(),
    platform: z.string().optional(),
    items: z.array(orderItemSchema).min(1),
    shippingCost: z.number().min(0),
    notes: z.string().optional()
});

/**
 * GET /api/orders
 * Get all orders for the current tenant
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { status, search, sortBy = 'createdAt', sortOrder = 'desc', customerId } = req.query;

        const where: any = {
            tenantId: tenantId
        };

        // Filter by customerId
        if (customerId && typeof customerId === 'string') {
            console.log(`Filtering orders for customerId: ${customerId}`);
            where.customerId = customerId;
        } else {
            console.log('No customerId filter provided or invalid type:', customerId);
        }

        // Filter by status
        if (status && typeof status === 'string') {
            where.status = status;
        }

        // Search in order number or customer name
        if (search && typeof search === 'string') {
            where.OR = [
                { orderNumber: { contains: search } },
                { externalOrderId: { contains: search } },
                {
                    customer: {
                        OR: [
                            { firstName: { contains: search } },
                            { lastName: { contains: search } },
                            { customerNumber: { contains: search } }
                        ]
                    }
                }
            ];
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { [sortBy as string]: sortOrder as any }
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * GET /api/orders/:id
 * Get order details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const order = await prisma.order.findFirst({
            where: {
                id,
                tenantId: tenantId
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                },
                shippingLabels: true,
                documents: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = createOrderSchema.parse(req.body);

        // Verify customer belongs to tenant
        const customer = await prisma.customer.findFirst({
            where: {
                id: data.customerId,
                tenantId: tenantId
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Calculate total price
        const totalPrice = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + data.shippingCost;

        // Create order with items
        const order = await prisma.order.create({
            data: {
                tenantId: tenantId,
                orderNumber,
                customerId: data.customerId,
                externalOrderId: data.externalOrderId,
                platform: data.platform || 'MANUAL',
                shippingCost: data.shippingCost,
                totalPrice,
                notes: data.notes,
                items: {
                    create: data.items
                }
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        res.status(201).json({ order });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify order belongs to tenant
        const existing = await prisma.order.findFirst({
            where: {
                id,
                tenantId: tenantId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        res.json({ order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

/**
 * PUT /api/orders/:id/tracking
 * Update tracking information manually
 */
router.put('/:id/tracking', async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { trackingNumber, carrier, notifyEtsy } = req.body;
        const tenantId = req.user?.tenantId;
        const userId = req.user?.id; // Needed for Etsy sync config check

        if (!tenantId || !userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!trackingNumber) {
            return res.status(400).json({ error: 'Tracking number is required' });
        }

        const order = await prisma.order.findFirst({
            where: { id, tenantId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                trackingNumber,
                status: OrderStatus.SHIPPED, // Assume shipped if tracking allowed
                shippedAt: new Date(),
                isSyncedToEtsy: false // Default to false (pending sync)
            }
        });

        // Sync to Etsy if requested
        if (notifyEtsy && order.platform === 'ETSY' && order.externalOrderId) {
            try {
                // Determine carrier code/name for Etsy
                const carrierName = carrier || 'DHL';

                console.log(`[Manual Tracking (Route)] Calling syncTrackingToEtsy... Tenant: ${tenantId}, User: ${userId}, ExtID: ${order.externalOrderId}`);
                await etsyTrackingService.syncTrackingToEtsy(
                    tenantId,
                    userId,
                    order.externalOrderId, // Valid Etsy Receipt ID
                    trackingNumber,
                    carrierName
                );
                console.log(`[Manual Tracking (Route)] Synced ${trackingNumber} (${carrierName}) to Etsy for Order ${order.externalOrderId}`);

                // If successful, mark as synced
                await prisma.order.update({
                    where: { id },
                    data: { isSyncedToEtsy: true }
                });

            } catch (syncErr: any) {
                console.error(`[Manual Tracking (Route)] Failed to sync to Etsy:`, syncErr);
                // Remains isSyncedToEtsy: false, will be picked up by Sync Button / Cron
            }
        }

        res.json({ order: updatedOrder });
    } catch (error) {
        console.error('Update tracking error:', error);
        res.status(500).json({ error: 'Failed to update tracking' });
    }
});

export default router;
