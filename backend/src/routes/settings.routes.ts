import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import numberRangeService from '../services/number-range.service';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { PrinterService } from '../services/printer.service';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// GET /api/settings - Get current settings
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch User (with profiles) and Settings
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                shopName: true,
                firstName: true,
                lastName: true,
                email: true,
                labelProfiles: true // Include profiles
            }
        });

        let settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId }
            });
        }

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

// GET /api/settings/printers - Get available printers
router.get('/printers', async (req: Request, res: Response) => {
    try {
        const printers = await PrinterService.getPrinters();
        res.json(printers);
    } catch (error) {
        console.error('Get printers error:', error);
        res.status(500).json({ error: 'Failed to get printers' });
    }
});

// PUT /api/settings - Update settings
router.put('/', async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const {
            // User Profile
            firstName,
            lastName,
            shopName,

            // Label Profiles (Array)
            labelProfiles,

            // DHL Paket
            dhlGkpUsername,
            dhlGkpPassword,
            dhlEnabled,

            // Deutsche Post
            deutschePostUsername,
            deutschePostPassword,
            deutschePostClientId,
            deutschePostClientSecret,
            deutschePostEnabled,

            // Printers (Global)
            printerInvoice,
            formatInvoice,
            printerDeliveryNote,
            formatDeliveryNote,
            printerLabel,
            formatLabel,
            defaultPrinter,
            autoPrintEnabled,

            // Printers (Specific - Legacy)
            printerDeutschePost,
            printerDHL,

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

            // Number Formats
            orderNumberFormat,
            invoiceNumberFormat,
            deliveryNoteFormat,
            supplierOrderFormat,
            customerNumberFormat,
            skuPrefix
        } = req.body;

        await prisma.$transaction(async (tx) => {
            // 1. Update User Profile & Label Profiles
            const userUpdateData: any = {
                firstName,
                lastName,
                shopName
            };

            if (Array.isArray(labelProfiles)) {
                // Replace all profiles for simplicity
                userUpdateData.labelProfiles = {
                    deleteMany: {},
                    create: labelProfiles.map((p: any) => ({
                        name: p.name,
                        printerName: p.printerName,
                        format: p.format,
                        layoutJson: p.layoutJson
                    }))
                };
            }

            await tx.user.update({
                where: { id: userId },
                data: userUpdateData
            });

            // 2. Update Settings
            await tx.userSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    dhlGkpUsername,
                    dhlGkpPassword,
                    dhlEnabled,
                    deutschePostUsername,
                    deutschePostPassword,
                    deutschePostClientId,
                    deutschePostClientSecret,
                    deutschePostEnabled,

                    printerInvoice,
                    formatInvoice,
                    printerDeliveryNote,
                    formatDeliveryNote,
                    printerLabel,
                    formatLabel,
                    defaultPrinter,
                    autoPrintEnabled,

                    printerDeutschePost,
                    printerDHL,

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

                    orderNumberFormat,
                    invoiceNumberFormat,
                    deliveryNoteFormat,
                    supplierOrderFormat,
                    customerNumberFormat,
                    skuPrefix,

                    orderNumberCurrent: req.body.orderNumberCurrent,
                    invoiceNumberCurrent: req.body.invoiceNumberCurrent,
                    deliveryNoteCurrent: req.body.deliveryNoteCurrent,
                    supplierOrderCurrent: req.body.supplierOrderCurrent,
                    customerNumberCurrent: req.body.customerNumberCurrent,
                    nextProductId: req.body.nextProductId
                },
                update: {
                    dhlGkpUsername,
                    dhlGkpPassword,
                    dhlEnabled,
                    deutschePostUsername,
                    deutschePostPassword,
                    deutschePostClientId,
                    deutschePostClientSecret,
                    deutschePostEnabled,

                    printerInvoice,
                    formatInvoice,
                    printerDeliveryNote,
                    formatDeliveryNote,
                    printerLabel,
                    formatLabel,
                    defaultPrinter,
                    autoPrintEnabled,

                    printerDeutschePost,
                    printerDHL,

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

                    orderNumberFormat,
                    invoiceNumberFormat,
                    deliveryNoteFormat,
                    supplierOrderFormat,
                    customerNumberFormat,
                    skuPrefix,

                    orderNumberCurrent: req.body.orderNumberCurrent,
                    invoiceNumberCurrent: req.body.invoiceNumberCurrent,
                    deliveryNoteCurrent: req.body.deliveryNoteCurrent,
                    supplierOrderCurrent: req.body.supplierOrderCurrent,
                    customerNumberCurrent: req.body.customerNumberCurrent,
                    nextProductId: req.body.nextProductId
                }
            });
        });

        res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
// ... imports
import path from 'path';
import fs from 'fs';
import mime from 'mime-types'; // You might need to install this or match manually

// ...

// Serve Logo Preview
router.get('/logo-preview', authenticateToken, async (req: Request, res: Response) => {
    try {
        const filePath = req.query.path as string;
        if (!filePath) {
            return res.status(400).json({ error: 'Path required' });
        }

        // Security: Prevent traversal? 
        // For a local single-tenant app, maybe less strict, but good practice.
        // const safePath = path.resolve(filePath); 

        if (fs.existsSync(filePath)) {
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';
            res.setHeader('Content-Type', mimeType);
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Logo preview error:', error);
        res.status(500).json({ error: 'Failed to serve logo' });
    }
});

export default router;
