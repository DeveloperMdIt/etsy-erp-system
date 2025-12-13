import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ActivityLogService, LogType, LogAction } from '../services/activity-log.service';
import prisma from '../utils/prisma';

const router = Router();

// GET /api/logs - Fetch activity logs for current tenant
router.get('/', authenticateToken, async (req: any, res: Response) => {
    try {
        const tenantId = req.user.tenantId;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const type = req.query.type as LogType | undefined;
        const action = req.query.action as LogAction | undefined;

        const logs = await ActivityLogService.getLogs(tenantId, limit, type, action);
        res.json(logs);
    } catch (error: any) {
        console.error('Failed to fetch logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// POST /api/logs - Create a log entry (for frontend logging)
router.post('/', authenticateToken, async (req: any, res: Response) => {
    try {
        const { type, action, details } = req.body;
        const userId = req.user.id;
        const tenantId = req.user.tenantId;

        if (!type || !action) {
            return res.status(400).json({ error: 'Type and action are required' });
        }

        await ActivityLogService.log(
            type as LogType,
            action as LogAction,
            details || '',
            userId,
            tenantId
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Failed to create log:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

export default router;
