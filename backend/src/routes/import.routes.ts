import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { EtsyImportService } from '../services/etsy-import.service';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const importService = new EtsyImportService();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// POST /api/import/etsy
router.post('/etsy', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        // TODO: Get tenantId from authenticated user
        // For now, we'll use a default or header
        const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';

        const result = await importService.importOrdersFromCsv(req.file.path, tenantId);

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
