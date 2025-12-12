
import cron from 'node-cron';
import prisma from '../utils/prisma';
import { EtsyImportService } from './etsy-import.service';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';

const etsyImportService = new EtsyImportService();

// Keep track of active tasks to prevent overlap
let isImportRunning = false;
let currentTask: any = null;

export class CronService {

    static init() {
        console.log('[Cron] Initializing Cron Service...');
        this.scheduleImportJob();
    }

    static async scheduleImportJob() {
        // Default: Every hour
        // TODO: Load from UserSettings
        // For now, hardcoded to run every hour at minute 0

        if (currentTask) {
            currentTask.stop();
        }

        console.log('[Cron] Scheduling Etsy Sync for every hour...');

        // Schedule: "0 * * * *" = Every hour at minute 0
        currentTask = cron.schedule('0 * * * *', async () => {
            await this.runEtsySync();
        });
    }

    static async runEtsySync(manualTriggerUser?: { id: string, tenantId: string }) {
        if (isImportRunning) {
            console.log('[Cron] Sync skipped - already running.');
            if (manualTriggerUser) {
                await ActivityLogService.log(LogType.WARNING, LogAction.MANUAL_SYNC, 'Sync skipped - already running', manualTriggerUser.id, manualTriggerUser.tenantId);
            }
            return;
        }

        isImportRunning = true;
        const triggerType = manualTriggerUser ? LogAction.MANUAL_SYNC : LogAction.CRON_SYNC;
        console.log(`[Cron] Starting ${triggerType}...`);

        try {
            // Find users who have Etsy connected
            const usersWithEtsy = await prisma.user.findMany({
                where: {
                    etsyAccessToken: { not: null },
                    etsyShopId: { not: null }
                },
                select: { id: true, tenantId: true, email: true }
            });

            if (usersWithEtsy.length === 0) {
                console.log('[Cron] No users with Etsy connection found.');
                if (manualTriggerUser) {
                    await ActivityLogService.log(
                        LogType.ERROR,
                        LogAction.SYNC_ORDERS_FAILED,
                        'Benutzer ist nicht mit Etsy verbunden. Bitte verbinden Sie zuerst Ihren Shop.',
                        manualTriggerUser.id,
                        manualTriggerUser.tenantId
                    );
                }
                return;
            }

            const { EtsyApiService } = require('./etsy-api.service');

            for (const user of usersWithEtsy) {
                console.log(`[Cron] Syncing for User ${user.email} (${user.id})...`);

                // LOG: Start Fetching
                await ActivityLogService.log(LogType.INFO, LogAction.CRON_SYNC, 'Bestellungen werden von Etsy abgerufen...', user.id, user.tenantId);

                try {
                    // 1. Sync Orders
                    const orders = await EtsyApiService.fetchOrders(user.id);
                    console.log(`[Cron] User ${user.id}: Fetched ${orders.length} orders.`);

                    // LOG: Fetched
                    await ActivityLogService.log(LogType.INFO, LogAction.CRON_SYNC, `${orders.length} Bestellungen gefunden. Importiere in Datenbank...`, user.id, user.tenantId);

                    if (orders.length > 0) {
                        await etsyImportService.importOrdersFromApi(orders, user.tenantId, user.id);
                    } else {
                        console.log(`[Cron] User ${user.id}: No new orders.`);
                        await ActivityLogService.log(LogType.INFO, LogAction.SYNC_ORDERS_SUCCESS, 'Keine neuen Bestellungen gefunden.', user.id, user.tenantId);
                    }

                    // 3. Push Local Updates (Tracking, Status) to Etsy
                    try {
                        await etsyImportService.pushUpdatesToEtsy(user.tenantId, user.id);
                    } catch (pushErr: any) {
                        console.error(`[Cron] Failed to push updates for user ${user.id}:`, pushErr);
                    }

                    // 2. Sync Products (Optional)
                    try {
                        const products = await EtsyApiService.fetchProducts(user.id);
                        console.log(`[Cron] User ${user.id}: Fetched ${products.length} products.`);
                    } catch (pErr) {
                        console.error(`[Cron] Product Sync Error for ${user.id}:`, pErr);
                    }

                } catch (err: any) {
                    console.error(`[Cron] Failed to sync for user ${user.id}:`, err);
                    await ActivityLogService.log(LogType.ERROR, LogAction.SYNC_ORDERS_FAILED, `Sync fehlgeschlagen: ${err.message}`, user.id, user.tenantId);
                }
            }
        } catch (error: any) {
            console.error('[Cron] Global Sync Error:', error);
        } finally {
            isImportRunning = false;
        }
    }

    static async runProductSync(user: { id: string, tenantId: string }) {
        console.log(`[Cron] Starting Product Sync for User ${user.id}...`);
        try {
            const { EtsyImportService } = await import('./etsy-import.service');
            const service = new EtsyImportService();
            const result = await service.importProductsFromApi(user.id, user.tenantId);

            await ActivityLogService.log(
                result.errors.length > 0 ? LogType.WARNING : LogType.SUCCESS,
                LogAction.IMPORT_PRODUCTS,
                `Produkt-Import Hintergund: ${result.imported} neu, ${result.updated} aktualisiert.`,
                user.id,
                user.tenantId
            );
        } catch (error: any) {
            console.error('[Cron] Product Sync Failed:', error);
            await ActivityLogService.log(
                LogType.ERROR,
                LogAction.IMPORT_PRODUCTS,
                `Produkt-Import fehlgeschlagen: ${error.message}`,
                user.id,
                user.tenantId
            );
        }
    }
}
