
import prisma from '../utils/prisma';

export enum LogType {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING'
}

export enum LogAction {
    LOGIN = 'LOGIN',
    ETSY_SYNC = 'ETSY_SYNC',
    IMPORT_PRODUCTS = 'IMPORT_PRODUCTS',
    IMPORT_ORDERS = 'IMPORT_ORDERS',
    SETTINGS_UPDATE = 'SETTINGS_UPDATE',
    MANUAL_SYNC = 'MANUAL_SYNC',
    CRON_SYNC = 'CRON_SYNC',
    SYNC_ORDERS_ATTEMPT = 'SYNC_ORDERS_ATTEMPT',
    SYNC_ORDERS_SUCCESS = 'SYNC_ORDERS_SUCCESS',
    SYNC_ORDERS_FAILED = 'SYNC_ORDERS_FAILED',
    SYNC_PRODUCTS_ATTEMPT = 'SYNC_PRODUCTS_ATTEMPT',
    SYNC_PRODUCTS_SUCCESS = 'SYNC_PRODUCTS_SUCCESS',
    SYNC_PRODUCTS_FAILED = 'SYNC_PRODUCTS_FAILED'
}

export class ActivityLogService {

    /**
     * Create a new log entry
     */
    static async log(
        type: LogType,
        action: LogAction,
        message: string,
        userId?: string,
        tenantId?: string,
        details?: any
    ) {
        try {
            await prisma.activityLog.create({
                data: {
                    type,
                    action,
                    tenantId,
                    userId,
                    // If details object provided, include message in it. Otherwise use message as string.
                    details: details ? JSON.stringify({ message, ...details }) : message
                }
            });
            console.log(`[LOG] ${type} ${action}: ${message}`);
        } catch (error) {
            console.error('Failed to create activity log', error);
        }
    }

    /**
     * Get recent logs for a tenant
     */
    static async getLogs(tenantId: string, limit = 50) {
        return prisma.activityLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}
