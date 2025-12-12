import axios from 'axios';
import prisma from '../utils/prisma';
import { rateLimitedPost } from '../utils/etsy-rate-limiter';

/**
 * Etsy Tracking Service
 * 
 * Syncs tracking numbers to Etsy orders
 * API: POST /v3/application/shops/{shop_id}/receipts/{receipt_id}/tracking
 */

const ETSY_API_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';

export class EtsyTrackingService {
    /**
     * Sync tracking number to Etsy
     */
    async syncTrackingToEtsy(tenantId: string, userId: string, etsyReceiptId: string, trackingNumber: string, carrier: string = 'Deutsche Post'): Promise<boolean> {
        try {
            // Get user's Etsy credentials
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user?.etsyAccessToken || !user?.etsyShopId) {
                throw new Error('Etsy credentials not found');
            }

            // Check if Etsy sync is enabled
            const settings = await prisma.userSettings.findUnique({
                where: { userId }
            });

            if (settings && !settings.etsySyncEnabled) {
                console.log('⏭️  Etsy sync is disabled, skipping');
                return false;
            }

            // Sync tracking to Etsy
            // Note: Etsy V3 API uses standard Bearer token (format: UserID.TokenString)
            const token = user.etsyAccessToken?.trim();
            const authHeader = `Bearer ${token}`;

            // Check if token looks suspiciously like just an ID (no dot) which would be wrong for V3
            if (!token?.includes('.')) {
                console.warn('[Etsy Sync] Warning: Access Token might be malformed (missing dot).');
            }

            console.log(`[Etsy Sync] Using Token: ${token?.substring(0, 15)}...`);

            const response = await rateLimitedPost(
                `https://openapi.etsy.com/v3/application/shops/${user.etsyShopId}/receipts/${etsyReceiptId}/tracking`,
                {
                    tracking_code: trackingNumber,
                    carrier_name: carrier,
                    send_bcc: true // Send email notification to buyer
                },
                {
                    headers: {
                        'x-api-key': ETSY_API_KEY, // Keystring (Client ID)
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10s timeout
                }
            );

            console.log('✅ Tracking synced to Etsy:', trackingNumber, 'Response:', response.data);

            // Log success to DB for UI
            await prisma.activityLog.create({
                data: {
                    userId: userId,
                    tenantId: tenantId,
                    type: 'SUCCESS',
                    action: 'ETSY_TRACKING_SYNC',
                    details: JSON.stringify({
                        order: etsyReceiptId,
                        tracking: trackingNumber,
                        carrier: carrier,
                        status: 'Synced'
                    })
                }
            });

            return true;
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message;
            console.error('❌ Failed to sync tracking to Etsy:', error.response?.data || error.message);

            // Log error to DB for UI
            try {
                await prisma.activityLog.create({
                    data: {
                        userId: userId,
                        tenantId: tenantId,
                        type: 'ERROR',
                        action: 'ETSY_TRACKING_SYNC',
                        details: JSON.stringify({
                            order: etsyReceiptId,
                            error: errorMsg,
                            fullError: error.response?.data
                        })
                    }
                });
            } catch (logErr) {
                console.error('Failed to write activity log', logErr);
            }

            // If it's a 429 error (rate limit), throw it
            if (error.response?.status === 429) {
                throw new Error('Etsy API rate limit exceeded. Please wait before trying again.');
            }

            throw new Error(`Etsy sync failed: ${errorMsg}`);
        }
    }
}

export default new EtsyTrackingService();
