import axios from 'axios';
import prisma from '../utils/prisma';

/**
 * Deutsche Post Internetmarke API Service
 * 
 * Simplified Authentication: Only Portokasse username and password required
 * (like Billbee - no separate API credentials needed)
 */

interface DeutschePostConfig {
    username: string;
    password: string;
}

interface AuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

interface LabelProduct {
    productCode: string;
    name: string;
    price: number;
    maxWeight: number;
}

interface CreateLabelRequest {
    productCode: string;
    weight: number;
    recipient: {
        name: string;
        street: string;
        postalCode: string;
        city: string;
        country?: string;
    };
    sender?: {
        name: string;
        street: string;
        postalCode: string;
        city: string;
        country?: string;
    };
}

interface CreateLabelResponse {
    trackingNumber: string;
    labelUrl: string;
    cost: number;
}

export class DeutschePostApiService {
    private baseUrl = 'https://api-eu.dhl.com/post/de/shipping/im/v1';
    private token: AuthToken | null = null;
    private tokenExpiry: Date | null = null;

    /**
     * Authenticate with Deutsche Post API using Portokasse credentials only
     */
    async authenticate(config: DeutschePostConfig): Promise<AuthToken> {
        try {
            // Simplified: Use Portokasse credentials directly
            // No separate API Client ID/Secret needed
            const response = await axios.post(`${this.baseUrl}/auth/accesstoken`, {
                grant_type: 'password',
                username: config.username,
                password: config.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.token = response.data;
            this.tokenExpiry = new Date(Date.now() + (this.token!.expires_in * 1000));

            console.log('✅ Deutsche Post authentication successful');
            return this.token!;
        } catch (error: any) {
            console.error('❌ Deutsche Post authentication failed:', error.response?.data || error.message);

            // User-friendly error messages
            if (error.response?.status === 401) {
                throw new Error('Ungültiger Benutzername oder Passwort. Bitte überprüfen Sie Ihre Portokasse-Zugangsdaten.');
            } else if (error.response?.status === 403) {
                throw new Error('Zugriff verweigert. Bitte aktivieren Sie die Geschäftsanwendung in Ihrer Portokasse unter "Meine Daten" → "Geschäftsanwendungen".');
            } else {
                throw new Error(`Verbindung fehlgeschlagen: ${error.response?.data?.error_description || error.message}`);
            }
        }
    }

    /**
     * Get valid access token (refresh if expired)
     */
    private async getValidToken(userId: string): Promise<string> {
        // Check if token exists and is not expired
        if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return this.token.access_token;
        }

        // Fetch credentials from database
        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        if (!settings?.deutschePostUsername || !settings?.deutschePostPassword) {
            throw new Error('Deutsche Post Zugangsdaten nicht konfiguriert. Bitte tragen Sie Ihren Portokasse-Benutzernamen und Passwort in den Versandeinstellungen ein.');
        }

        // Authenticate with Portokasse credentials
        const token = await this.authenticate({
            username: settings.deutschePostUsername,
            password: settings.deutschePostPassword
        });

        return token.access_token;
    }

    /**
     * Get Portokasse wallet balance
     */
    async getWalletBalance(userId: string): Promise<number> {
        try {
            const token = await this.getValidToken(userId);

            const response = await axios.get(`${this.baseUrl}/wallet`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const balance = response.data.balance || 0;

            // Update cached balance in database
            await prisma.userSettings.update({
                where: { userId },
                data: { deutschePostWalletBalance: balance }
            });

            return balance;
        } catch (error: any) {
            console.error('❌ Failed to get wallet balance:', error.response?.data || error.message);
            throw new Error(`Failed to get wallet balance: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get available shipping products
     */
    async getAvailableProducts(userId: string): Promise<LabelProduct[]> {
        try {
            const token = await this.getValidToken(userId);

            const response = await axios.get(`${this.baseUrl}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.products || [];
        } catch (error: any) {
            console.error('❌ Failed to get products:', error.response?.data || error.message);
            throw new Error(`Failed to get products: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Create shipping label (Internetmarke)
     */
    async createLabel(userId: string, request: CreateLabelRequest): Promise<CreateLabelResponse> {
        try {
            const token = await this.getValidToken(userId);

            const response = await axios.post(`${this.baseUrl}/orders`, {
                productCode: request.productCode,
                weight: request.weight,
                recipient: request.recipient,
                sender: request.sender
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Label created successfully:', response.data.trackingNumber);

            return {
                trackingNumber: response.data.trackingNumber || response.data.tracking_number,
                labelUrl: response.data.labelUrl || response.data.label_url,
                cost: response.data.cost || response.data.price || 0
            };
        } catch (error: any) {
            console.error('❌ Failed to create label:', error.response?.data || error.message);
            throw new Error(`Failed to create label: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Download label PDF
     */
    async downloadLabel(labelUrl: string): Promise<Buffer> {
        try {
            const response = await axios.get(labelUrl, {
                responseType: 'arraybuffer'
            });

            return Buffer.from(response.data);
        } catch (error: any) {
            console.error('❌ Failed to download label:', error.message);
            throw new Error(`Failed to download label: ${error.message}`);
        }
    }

    /**
     * Test connection to Deutsche Post API
     */
    async testConnection(config: DeutschePostConfig): Promise<{ success: boolean; balance?: number; error?: string }> {
        try {
            // Try to authenticate with Portokasse credentials
            await this.authenticate(config);

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export default new DeutschePostApiService();
