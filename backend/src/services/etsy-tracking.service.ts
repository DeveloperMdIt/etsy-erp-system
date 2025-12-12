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
    async syncTrackingToEtsy(userId: string, etsyReceiptId: string, trackingNumber: string): Promise<boolean> {
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
            const response = await rateLimitedPost(
                `https://openapi.etsy.com/v3/application/shops/${user.etsyShopId}/receipts/${etsyReceiptId}/tracking`,
                {
                    tracking_code: trackingNumber,
                    carrier_name: 'Deutsche Post',
                    send_bcc: true // Send email notification to buyer
                },
                {
                    headers: {
                        'x-api-key': ETSY_API_KEY,
                        'Authorization': `Bearer ${user.etsyAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Tracking synced to Etsy:', trackingNumber);
            return true;
        } catch (error: any) {
            console.error('❌ Failed to sync tracking to Etsy:', error.response?.data || error.message);

            // If it's a 429 error (rate limit), throw it
            if (error.response?.status === 429) {
                throw new Error('Etsy API rate limit exceeded. Please wait before trying again.');
            }

            throw new Error(`Etsy sync failed: ${error.response?.data?.error || error.message}`);
        }
    }
}

export default new EtsyTrackingService();
