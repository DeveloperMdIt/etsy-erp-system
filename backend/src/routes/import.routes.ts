import { Router, Request, Response } from 'express';
import multer from 'multer';
import { EtsyImportService } from '../services/etsy-import.service';
import { ProductCatalogImportService } from '../services/product-import.service';
import ImportStatusService from '../services/import-status.service';
import fs from 'fs';

import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const orderImportService = new EtsyImportService();
const productImportService = new ProductCatalogImportService();

// Apply auth middleware
router.use(authenticateToken);

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// GET /api/import/status
router.get('/status', (req, res) => {
    res.json(ImportStatusService.get());
});

// POST /api/import/etsy-orders
router.post('/etsy-orders', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID missing in token' });
        }

        // Asynchronously start import, don't wait for completion if we want to poll
        // But the previous implementation awaited it. 
        // We will AWAIT it but rely on frontend polling for updates concurrently?
        // Actually, if we await it, the response waits. Browsers might timeout.
        // It is better to return immediately? 
        // But the existing frontend expects a response with result.
        // I will keep await for now, but frontend can poll status in parallel.
        const result = await orderImportService.importOrdersFromCsv(req.file.path, tenantId);

        res.json(result);
    } catch (error: any) {
        console.error('Order import error:', error);
        res.status(500).json({
            error: 'Import failed',
            message: error.message
        });
    }
});

// POST /api/import/etsy-products
router.post('/etsy-products', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID missing in token' });
        }
        const result = await productImportService.importProductsFromCsv(req.file.path, tenantId);

        res.json(result);
    } catch (error: any) {
        console.error('Product import error:', error);
        res.status(500).json({
            error: 'Import failed',
            message: error.message
        });
    }
});

// Legacy route for backward compatibility
router.post('/etsy', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID missing in token' });
        }
        const result = await orderImportService.importOrdersFromCsv(req.file.path, tenantId);

        res.json(result);
    } catch (error: any) {
        console.error('Import error:', error);
        res.status(500).json({
            error: 'Import failed',
            message: error.message
        });
    }
});

export default router;
