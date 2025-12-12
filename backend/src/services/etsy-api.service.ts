import axios from 'axios';
import { rateLimitedGet } from '../utils/etsy-rate-limiter';
import prisma from '../utils/prisma';

const ETSY_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';

export class EtsyApiService {

    static async fetchOrders(userId: string) {
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyShopId) {
            throw new Error('User not connected to Etsy');
        }

        try {
            return await this._fetchOrdersInternal(user);
        } catch (error: any) {
            if (error.response?.status === 401 && user.etsyRefreshToken) {
                console.log('🔄 [EtsyAPI] Token expired (401). Attempting refresh...');
                try {
                    const newToken = await this.refreshAccessToken(userId, user.etsyRefreshToken);
                    user.etsyAccessToken = newToken; // Update local var for retry
                    return await this._fetchOrdersInternal(user);
                } catch (refreshErr) {
                    console.error('❌ [EtsyAPI] Refresh failed:', refreshErr);
                    throw new Error('Etsy Token Expired and Refresh Failed. Please reconnect.');
                }
            }
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.error('Etsy API Fetch Orders Error:', errorDetails);
            throw new Error(`Failed to fetch orders: ${errorDetails}`);
        }
    }

    private static async _fetchOrdersInternal(user: any) {
        const response = await rateLimitedGet(
            `https://openapi.etsy.com/v3/application/shops/${user.etsyShopId}/receipts?limit=100`,
            {
                headers: {
                    'x-api-key': ETSY_KEY,
                    'Authorization': `Bearer ${user.etsyAccessToken}`
                }
            }
        );
        return response.data.results;
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
}
