import { Router, Request, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { DHLService } from '../services/dhl.service';
import { CreateLabelSchema } from '../types/etsy-types';
import prisma from '../utils/prisma';
import deutschePostApiService from '../services/deutsche-post-api.service';
import dhlParcelService from '../services/dhl-parcel.service';
import labelGeneratorService from '../services/label-generator.service';
import printingService from '../services/printing.service';
import etsyTrackingService from '../services/etsy-tracking.service';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { ActivityLogService, LogType, LogAction } from '../services/activity-log.service';

const router = Router();
const dhlService = new DHLService();

// Configure multer for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `logo-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG and PNG images are allowed'));
        }
    }
});

// ============================================================================
// DHL PAKET API ROUTES (Post & Parcel Germany)
// ============================================================================

// POST /api/shipping/dhl/test - Test DHL Paket connection
router.post('/dhl/test', async (req: Request, res: Response) => {
    try {
        const { gkpUsername, gkpPassword } = req.body;

        if (!gkpUsername || !gkpPassword) {
            return res.status(400).json({ error: 'GKP Benutzername und Passwort erforderlich' });
        }

        const result = await dhlParcelService.testConnection({
            gkpUsername,
            gkpPassword
        });

        res.json(result);
    } catch (error: any) {
        console.error('DHL test connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/shipping/dhl/status - Get DHL Paket status
router.get('/dhl/status', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        const configured = !!(settings?.dhlGkpUsername && settings?.dhlGkpPassword);
        const enabled = settings?.dhlEnabled || false;

        res.json({
            configured,
            enabled,
            environment: process.env.DHL_API_ENVIRONMENT || 'sandbox'
        });
    } catch (error: any) {
        console.error('DHL status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// DHL ROUTES (existing - old DHL service)
// ============================================================================

// POST /api/shipping/dhl/create-label
router.post('/dhl/create-label', authenticateToken, async (req: Request, res: Response) => {
    try {
        const validation = CreateLabelSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
            return;
        }

        const tenantId = (req as AuthRequest).user?.tenantId;
        if (!tenantId) throw new Error('Tenant ID required');

        const { shippingMethodId } = req.body;
        const result = await dhlService.createLabel(validation.data, tenantId);

        // Log success
        await ActivityLogService.log(
            LogType.SUCCESS,
            LogAction.SHIPPING_LABEL_CREATE_SUCCESS,
            `DHL Label erstellt für Bestellung ${result.shipmentNumber}`,
            req.user?.id,
            req.user?.tenantId,
            { orderId: validation.data.orderId, shipmentNumber: result.shipmentNumber }
        );

        res.json(result);
    } catch (error: any) {
        console.error('Shipping error:', error);

        // Log error
        await ActivityLogService.log(
            LogType.ERROR,
            LogAction.SHIPPING_LABEL_CREATE_FAILED,
            `DHL Label Fehler: ${error.message}`,
            req.user?.id,
            req.user?.tenantId,
            { error: error.message, stack: error.stack }
        );

        res.status(500).json({
            error: 'Shipping label creation failed',
            message: error.message
        });
    }
});

// ============================================================================
// DEUTSCHE POST ROUTES
// ============================================================================

/**
 * GET /api/shipping/deutsche-post/status
 * Get Deutsche Post connection status
 */
router.get('/deutsche-post/status', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;

        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        const isConfigured = !!(
            settings?.deutschePostUsername &&
            settings?.deutschePostPassword &&
            settings?.deutschePostClientId &&
            settings?.deutschePostClientSecret
        );

        res.json({
            isConfigured,
            isEnabled: settings?.deutschePostEnabled || false,
            balance: settings?.deutschePostWalletBalance || 0
        });
    } catch (error: any) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

/**
 * POST /api/shipping/deutsche-post/test
 * Test Deutsche Post API connection
 */
router.post('/deutsche-post/test', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { username, password, clientId, clientSecret } = req.body;

        const result = await deutschePostApiService.testConnection({
            username,
            password
        });

        res.json(result);
    } catch (error: any) {
        console.error('Test connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/shipping/deutsche-post/balance
 * Get Portokasse wallet balance
 */
router.get('/deutsche-post/balance', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;

        const balance = await deutschePostApiService.getWalletBalance(userId);

        res.json({ balance });
    } catch (error: any) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/shipping/label/create
 * Create shipping label and auto-print
 */
router.post('/label/create', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;
        const tenantId = (req as AuthRequest).user!.tenantId;
        const { orderId, productCode, weight } = req.body;

        // Get order details
        const order = await prisma.order.findFirst({
            where: { id: orderId, tenantId },
            include: { customer: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Get user settings
        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        if (!settings) {
            return res.status(400).json({ error: 'User settings not found' });
        }

        // Create label via Deutsche Post API
        const labelResponse = await deutschePostApiService.createLabel(userId, {
            productCode,
            weight,
            recipient: {
                name: `${order.customer.firstName} ${order.customer.lastName}`,
                street: order.customer.street,
                postalCode: order.customer.postalCode,
                city: order.customer.city,
                country: order.customer.country
            },
            sender: settings.labelCompanyName ? {
                name: settings.labelCompanyName,
                street: settings.labelStreet || '',
                postalCode: settings.labelPostalCode || '',
                city: settings.labelCity || '',
                country: settings.labelCountry || 'Deutschland'
            } : undefined
        });

        // Generate custom label PDF
        const labelDir = path.join(process.cwd(), 'uploads', 'labels');
        if (!fs.existsSync(labelDir)) {
            fs.mkdirSync(labelDir, { recursive: true });
        }

        const labelPath = path.join(labelDir, `label-${orderId}-${Date.now()}.pdf`);

        await labelGeneratorService.generateLabelPDF({
            senderName: settings.labelCompanyName || 'Absender',
            senderStreet: settings.labelStreet || '',
            senderPostalCode: settings.labelPostalCode || '',
            senderCity: settings.labelCity || '',
            senderCountry: settings.labelCountry || undefined, // Fix null vs undefined mismatch
            recipientName: `${order.customer.firstName} ${order.customer.lastName}`,
            recipientStreet: order.customer.street,
            recipientPostalCode: order.customer.postalCode,
            recipientCity: order.customer.city,
            recipientCountry: order.customer.country,
            trackingNumber: labelResponse.trackingNumber,
            logoPath: settings.labelLogoPath || undefined,
            sizePreset: settings.labelSizePreset || undefined
        }, labelPath);

        // Save shipping label
        const shippingLabel = await prisma.shippingLabel.create({
            data: {
                orderId: order.id,
                provider: 'DEUTSCHE_POST_BRIEF_KOMPAKT', // Enum value added to Schema
                trackingNumber: labelResponse.trackingNumber,
                labelPath: labelPath,
                labelUrl: labelResponse.labelUrl,
                weight: weight,
                cost: labelResponse.cost
            }
        });

        // Update order
        await prisma.order.update({
            where: { id: order.id },
            data: {
                trackingNumber: labelResponse.trackingNumber,
                status: 'SHIPPED',
                shippedAt: new Date()
            }
        });

        // Auto-print if enabled
        if (settings.autoPrintEnabled) {
            const printerName = settings.printerDeutschePost || settings.defaultPrinter;
            await printingService.printPDF(labelPath, printerName || undefined);
        }

        // Sync to Etsy if enabled
        if (settings.etsySyncEnabled && order.platform === 'ETSY' && order.externalOrderId) {
            try {
                // Determine tenantId from request
                const tenantId = (req as AuthRequest).user?.tenantId;
                if (tenantId) {
                    await etsyTrackingService.syncTrackingToEtsy(
                        tenantId,
                        userId,
                        order.externalOrderId,
                        labelResponse.trackingNumber,
                        'Deutsche Post'
                    );
                } else {
                    console.warn('Etsy sync skipped: No tenantId found in request.');
                }
            } catch (error) {
                console.error('Etsy sync failed (non-critical):', error);
            }
        }

        res.json({
            success: true,
            trackingNumber: labelResponse.trackingNumber,
            labelPath: labelPath,
            cost: labelResponse.cost,
            shippingLabelId: shippingLabel.id
        });
    } catch (error: any) {
        console.error('Create label error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/shipping/printers
 * Get available printers
 */
router.get('/printers', authenticateToken, async (req: Request, res: Response) => {
    try {
        const printers = await printingService.getAvailablePrinters();
        res.json({ printers });
    } catch (error: any) {
        console.error('Get printers error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/shipping/logo/upload
 * Upload company logo
 */
router.post('/logo/upload', authenticateToken, upload.single('logo'), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).user!.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const logoPath = req.file.path;

        await prisma.userSettings.update({
            where: { userId },
            data: { labelLogoPath: logoPath }
        });

        res.json({
            success: true,
            logoPath: logoPath,
            logoUrl: `/uploads/logos/${req.file.filename}`
        });
    } catch (error: any) {
        console.error('Logo upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

