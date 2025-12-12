import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import numberRangeService from '../services/number-range.service';
import skuManagementService from '../services/sku-management.service';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET /api/settings - Get current settings
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch User and Settings
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                shopName: true,
                firstName: true,
                lastName: true,
                email: true
            }
        });

        let settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        // If settings don't exist, return defaults (don't error 404)
        if (!settings) {
            // We can construct a default object here to send back, 
            // but strictly we should probably create it if it's missing to ensure consistency.
            // For now, let's create it if missing to self-heal.
            settings = await prisma.userSettings.create({
                data: { userId }
            });
        }

        // Preview what next numbers will look like
        const previews = {
            orderNumber: await numberRangeService.previewNumber('ORDER', userId),
            invoiceNumber: await numberRangeService.previewNumber('INVOICE', userId),
            deliveryNote: await numberRangeService.previewNumber('DELIVERY', userId),
            supplierOrder: await numberRangeService.previewNumber('SUPPLIER', userId),
            customerNumber: await numberRangeService.previewNumber('CUSTOMER', userId),
        };

        res.json({
            user,
            settings,
            previews,
        });
    } catch (error: any) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// PUT /api/settings - Update settings
router.put('/', async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const {
            // User Profile
            firstName,
            lastName,
            shopName,

            // DHL Paket
            dhlGkpUsername,
            dhlGkpPassword,
            dhlEnabled,
            printerDHL,

            // Deutsche Post
            deutschePostUsername,
            deutschePostPassword,
            deutschePostClientId,
            deutschePostClientSecret,
            deutschePostEnabled,
            printerDeutschePost,

            // Shared Shipping
            etsySyncEnabled,
            labelLogoPath,
            labelCompanyName,
            labelStreet,
            labelPostalCode,
            labelCity,
            labelCountry,
            labelPhone,
            labelSizePreset,
            labelCustomWidth,
            labelCustomHeight,
            defaultPrinter,
            autoPrintEnabled,

            // Number Formats
            orderNumberFormat,
            orderNumberStart,
            invoiceNumberFormat,
            invoiceNumberStart,
            deliveryNoteFormat,
            deliveryNoteStart,
            supplierOrderFormat,
            supplierOrderStart,
            customerNumberFormat,
            customerNumberStart,

            // SKU
            skuPrefix
        } = req.body;

        // Transaction to update both User and UserSettings
        await prisma.$transaction(async (tx) => {
            // Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    firstName,
                    lastName,
                    shopName
                }
            });

            // Update Settings (Upsert to handle missing records)
            await tx.userSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    // DHL Paket
                    dhlGkpUsername,
                    dhlGkpPassword,
                    dhlEnabled,
                    printerDHL,
                    // Deutsche Post
                    deutschePostUsername,
                    deutschePostPassword,
                    deutschePostClientId,
                    deutschePostClientSecret,
                    deutschePostEnabled,
                    printerDeutschePost,
                    // Shared
                    etsySyncEnabled,
                    labelLogoPath,
                    labelCompanyName,
                    labelStreet,
                    labelPostalCode,
                    labelCity,
                    labelCountry,
                    labelPhone,
                    labelSizePreset,
                    labelCustomWidth,
                    labelCustomHeight,
                    defaultPrinter,
                    autoPrintEnabled,
                    // Number Formats
                    orderNumberFormat,
                    invoiceNumberFormat,
                    deliveryNoteFormat,
                    supplierOrderFormat,
                    customerNumberFormat,
                    skuPrefix,
                    orderNumberStart,
                    invoiceNumberStart,
                    deliveryNoteStart,
                    supplierOrderStart,
                    customerNumberStart
                },
                update: {
                    // DHL Paket
                    dhlGkpUsername,
                    dhlGkpPassword,
                    dhlEnabled,
                    printerDHL,
                    // Deutsche Post
                    deutschePostUsername,
                    deutschePostPassword,
                    deutschePostClientId,
                    deutschePostClientSecret,
                    deutschePostEnabled,
                    printerDeutschePost,
                    // Shared
                    etsySyncEnabled,
                    labelLogoPath,
                    labelCompanyName,
                    labelStreet,
                    labelPostalCode,
                    labelCity,
                    labelCountry,
                    labelPhone,
                    labelSizePreset,
                    labelCustomWidth,
                    labelCustomHeight,
                    defaultPrinter,
                    autoPrintEnabled,
                    // Number Formats
                    orderNumberFormat,
                    invoiceNumberFormat,
                    deliveryNoteFormat,
                    supplierOrderFormat,
                    customerNumberFormat,
                    skuPrefix,
                    orderNumberStart,
                    invoiceNumberStart,
                    deliveryNoteStart,
                    supplierOrderStart,
                    customerNumberStart
                }
            });
        });

        res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
