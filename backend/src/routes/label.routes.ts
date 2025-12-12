import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { LabelGeneratorService } from '../services/label-generator.service';

const router = Router();
const labelService = new LabelGeneratorService();

// Generate Preview PDF from designer
router.post('/preview', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { layout, testData } = req.body;

        if (!layout) {
            return res.status(400).json({ error: 'Layout required' });
        }

        // Create label data object
        const labelData = {
            senderName: testData.senderName || 'Absender',
            senderStreet: testData.senderStreet || 'Straße',
            senderPostalCode: testData.senderPostalCode || '00000',
            senderCity: testData.senderCity || 'Stadt',
            recipientName: testData.recipientName || 'Empfänger',
            recipientStreet: testData.recipientStreet || 'Straße',
            recipientPostalCode: testData.recipientPostalCode || '00000',
            recipientCity: testData.recipientCity || 'Stadt',
            recipientCountry: testData.recipientCountry || '',
            trackingNumber: testData.trackingNumber || '',
            layout: layout // Pass the full layout object
        };

        const pdfBuffer = await labelService.generateLabelPDF(labelData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="label-preview.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Label preview error:', error);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
});

export default router;
