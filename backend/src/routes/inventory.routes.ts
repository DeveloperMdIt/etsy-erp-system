import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { InventoryService } from '../services/inventory.service';
import prisma from '../utils/prisma';

const router = Router();

// 1. Get Stock for a Product
router.get('/product/:productId', authenticateToken, async (req: any, res: Response) => {
    try {
        const { productId } = req.params;
        const tenantId = req.user.tenantId;

        const stock = await InventoryService.getProductStock(tenantId, productId);
        res.json(stock);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Add Stock (Goods In)
router.post('/add', authenticateToken, async (req: any, res: Response) => {
    try {
        const { productId, locationName, quantity } = req.body;
        const tenantId = req.user.tenantId;
        const userId = req.user.id;

        const result = await InventoryService.addStock(tenantId, userId, productId, locationName, parseInt(quantity));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Remove Stock (Pick/Correction)
router.post('/remove', authenticateToken, async (req: any, res: Response) => {
    try {
        const { productId, locationName, quantity } = req.body;
        const tenantId = req.user.tenantId;
        const userId = req.user.id; // User doing the action

        const result = await InventoryService.removeStock(tenantId, userId, productId, locationName, parseInt(quantity));
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Move Stock
router.post('/move', authenticateToken, async (req: any, res: Response) => {
    try {
        const { productId, fromLocation, toLocation, quantity } = req.body;
        const tenantId = req.user.tenantId;
        const userId = req.user.id;

        await InventoryService.moveStock(tenantId, userId, productId, fromLocation, toLocation, parseInt(quantity));
        res.json({ success: true, message: `Moved ${quantity} from ${fromLocation} to ${toLocation}` });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 5. List all locations (for autocomplete)
router.get('/locations', authenticateToken, async (req: any, res: Response) => {
    try {
        const tenantId = req.user.tenantId;
        const locations = await prisma.storageLocation.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
        res.json(locations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
