import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import numberRangeService from '../services/number-range.service';
import skuManagementService from '../services/sku-management.service';

const router = Router();
const prisma = new PrismaClient();

// GET /api/setup/status - Check if setup is required
router.get('/status', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        res.json({
            setupRequired: !settings?.setupCompleted,
            setupCompleted: settings?.setupCompleted || false,
        });
    } catch (error: any) {
        console.error('Setup status error:', error);
        res.status(500).json({ error: 'Failed to get setup status' });
    }
});

// GET /api/setup/settings - Get current settings for editing
router.get('/settings', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const settings = await prisma.user_settings.findUnique({
            where: { userId },
        });

        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        // Preview what next numbers will look like
        const previews = {
            orderNumber: await numberRangeService.previewNumber('ORDER', userId),
            invoiceNumber: await numberRangeService.previewNumber('INVOICE', userId),
            deliveryNote: await numberRangeService.previewNumber('DELIVERY', userId),
            supplierOrder: await numberRangeService.previewNumber('SUPPLIER', userId),
            nextSKU: await skuManagementService.previewNextSKU(userId),
        };

        res.json({
            settings,
            previews,
        });
    } catch (error: any) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// POST /api/setup/complete - Save all settings and mark setup complete
router.post('/complete', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const {
            // Order numbers
            orderNumberFormat,
            orderNumberStart,

            // Invoice numbers
            invoiceNumberFormat,
            invoiceNumberStart,

            // Delivery notes
            deliveryNoteFormat,
            deliveryNoteStart,

            // Supplier orders
            supplierOrderFormat,
            supplierOrderStart,

            // SKU settings
            skuPrefix,
        } = req.body;

        // Update or create settings
        const settings = await prisma.user_settings.upsert({
            where: { userId },
            create: {
                userId,
                orderNumberFormat,
                orderNumberStart,
                orderNumberCurrent: orderNumberStart,
                invoiceNumberFormat,
                invoiceNumberStart,
                invoiceNumberCurrent: invoiceNumberStart,
                deliveryNoteFormat,
                deliveryNoteStart,
                deliveryNoteCurrent: deliveryNoteStart,
                supplierOrderFormat,
                supplierOrderStart,
                supplierOrderCurrent: supplierOrderStart,
                skuPrefix,
                setupCompleted: true,
                setupCompletedAt: new Date(),
            },
            update: {
                orderNumberFormat,
                orderNumberStart,
                orderNumberCurrent: orderNumberStart,
                invoiceNumberFormat,
                invoiceNumberStart,
                invoiceNumberCurrent: invoiceNumberStart,
                deliveryNoteFormat,
                deliveryNoteStart,
                deliveryNoteCurrent: deliveryNoteStart,
                supplierOrderFormat,
                supplierOrderStart,
                supplierOrderCurrent: supplierOrderStart,
                skuPrefix,
                setupCompleted: true,
                setupCompletedAt: new Date(),
            },
        });

        res.json({
            message: 'Setup completed successfully',
            settings,
        });
    } catch (error: any) {
        console.error('Setup complete error:', error);
        res.status(500).json({ error: 'Failed to complete setup' });
    }
});

export default router;
