import { Router, Request, Response } from 'express';
import { DHLService } from '../services/dhl.service';
import { CreateLabelSchema } from '../types/etsy-types';

const router = Router();
const dhlService = new DHLService();

// POST /api/shipping/dhl/create-label
router.post('/dhl/create-label', async (req: Request, res: Response) => {
    try {
        const validation = CreateLabelSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
            return;
        }

        const result = await dhlService.createLabel(validation.data);
        res.json(result);
    } catch (error: any) {
        console.error('Shipping error:', error);
        res.status(500).json({
            error: 'Shipping label creation failed',
            message: error.message
        });
    }
});

export default router;
