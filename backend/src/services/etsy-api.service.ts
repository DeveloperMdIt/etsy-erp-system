import axios from 'axios';
import { rateLimitedGet } from '../utils/etsy-rate-limiter';
import prisma from '../utils/prisma';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';

// Keys checked and confirmed matching user provided credentials
const ETSY_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';

export class EtsyApiService {


    // Method removed (duplicate). See fetchOrders below with minLastUpdated support.


    /**
     * Fetch Single Receipt Details (Full PII often requires direct fetch)
     */
    static async fetchReceipt(userId: string, receiptId: number | string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected');
        }

        try {
            const response = await rateLimitedGet(
                `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/receipts/${receiptId}`,
                {
                    headers: {
                        'x-api-key': ETSY_KEY,
                        'Authorization': `Bearer ${user.etsyAccessToken}`
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching receipt ${receiptId}`, error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Fetch Single Listing Details (Images, Description, etc.)
     */
    static async fetchListingDetails(userId: string, listingId: string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected');
        }

        try {
            // Include images in the response
            const response = await rateLimitedGet(
                `https://openapi.etsy.com/v3/application/listings/${listingId}?includes=images`,
                {
                    headers: {
                        'x-api-key': ETSY_KEY,
                        'Authorization': `Bearer ${user.etsyAccessToken}`
                    }
                }
            );
            if (response.data) {
                // DEBUG: Log Headers to verify scopes
                console.log('🔍 Etsy API Headers (Scopes):', response.headers['x-oauth-scopes'] || 'N/A');
            }
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching listing ${listingId}`, error.response?.data || error.message);
            return null;
        }
    }

    static async fetchProducts(userId: string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected to Etsy');
        }

        try {
            return await this._fetchProductsInternal(user);
        } catch (error: any) {
            if (error.response?.status === 401 && user.etsyRefreshToken) {
                console.log('🔄 [EtsyAPI] Token expired (401). Attempting refresh...');
                try {
                    const newToken = await this.refreshAccessToken(userId, user.etsyRefreshToken);
                    user.etsyAccessToken = newToken;
                    return await this._fetchProductsInternal(user);
                } catch (refreshErr) {
                    throw new Error('Etsy Token Expired and Refresh Failed.');
                }
            }
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            throw new Error(`Failed to fetch products: ${errorDetails}`);
        }
    }

    private static async _fetchProductsInternal(user: any) {
        const response = await rateLimitedGet(
            `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/listings/active?limit=100`,
            {
                headers: {
                    'x-api-key': ETSY_KEY,
                    'Authorization': `Bearer ${user.etsyAccessToken}`
                }
            }
        );
        return response.data.results;
    }

    static async fetchOrders(userId: string, options: {
        minLastUpdated?: Date;
        minCreated?: Date;
        maxCreated?: Date;
        limit?: number;
        offset?: number;
    } = {}) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected to Etsy');
        }

        try {
            return await this._fetchOrdersInternal(user, options);
        } catch (error: any) {
            if (error.response?.status === 401 && user.etsyRefreshToken) {
                console.log('🔄 [EtsyAPI] Token expired (401). Attempting refresh...');
                try {
                    const newToken = await this.refreshAccessToken(userId, user.etsyRefreshToken);
                    user.etsyAccessToken = newToken;
                    return await this._fetchOrdersInternal(user, options);
                } catch (refreshErr) {
                    throw new Error('Etsy Token Expired and Refresh Failed.');
                }
            }
            throw new Error(`Failed to fetch orders: ${error.message}`);
        }
    }

    private static async _fetchOrdersInternal(user: any, options: {
        minLastUpdated?: Date;
        minCreated?: Date;
        maxCreated?: Date;
        limit?: number;
        offset?: number;
    }) {
        const limit = options.limit || 100;
        const offset = options.offset || 0;

        let url = `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/receipts?limit=${limit}&offset=${offset}`;

        if (options.minLastUpdated) {
            const timestamp = Math.floor(options.minLastUpdated.getTime() / 1000);
            url += `&min_last_updated=${timestamp}`;
        }

        if (options.minCreated) {
            const timestamp = Math.floor(options.minCreated.getTime() / 1000);
            url += `&min_created=${timestamp}`;
        }

        if (options.maxCreated) {
            const timestamp = Math.floor(options.maxCreated.getTime() / 1000);
            url += `&max_created=${timestamp}`;
        }

        console.log(`[EtsyAPI] Fetching orders with offset=${offset}, limit=${limit}`);

        const response = await rateLimitedGet(
            url,
            {
                headers: {
                    'x-api-key': ETSY_KEY,
                    'Authorization': `Bearer ${user.etsyAccessToken}`
                }
            }
        );

        // Debug first order only on first page
        if (offset === 0 && response.data?.results?.length > 0) {
            // ... keys logging if needed ...
        }

        return {
            results: response.data.results,
            count: response.data.count, // Etsy V3 often returns 'count' at top level
        };
    }

    static async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
        console.log('🔵 [EtsyAPI] Refreshing Token...');
        const response = await axios.post('https://api.etsy.com/v3/public/oauth/token', {
            grant_type: 'refresh_token',
            client_id: ETSY_KEY,
            refresh_token: refreshToken
        });

        const { access_token, refresh_token, expires_in } = response.data;

        await prisma.user.update({
            where: { id: userId },
            data: {
                etsyAccessToken: access_token,
                etsyRefreshToken: refresh_token,
                tokenExpiresAt: new Date(Date.now() + expires_in * 1000)
            }
        });

        console.log('✅ [EtsyAPI] Token Refreshed & Saved.');
        return access_token;
    }

    /**
     * Update Order Shipping Status (Add Tracking)
     * This marks the order as shipped on Etsy.
     */
    static async updateOrderTracking(userId: string, receiptId: string | number, trackingCode: string, carrier: string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected to Etsy');
        }

        try {
            // V3: Create a tracking record to mark as shipped
            const url = `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/receipts/${receiptId}/tracking`;

            console.log(`[EtsyAPI] Updating tracking for Receipt ${receiptId} (Code: ${trackingCode}, Carrier: ${carrier})`);

            await axios.post(
                url,
                {
                    tracking_code: trackingCode,
                    carrier_name: carrier
                },
                {
                    headers: {
                        'x-api-key': ETSY_KEY,
                        'Authorization': `Bearer ${user.etsyAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return { success: true };

        } catch (error: any) {
            if (error.response?.status === 401 && user.etsyRefreshToken) {
                // Retry logic could go here, for now throw
            }
            console.error(`Error updating tracking for ${receiptId}`, error.response?.data || error.message);
            throw new Error(`Failed to update Etsy tracking: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }
}
