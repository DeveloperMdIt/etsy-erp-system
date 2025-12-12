import axios from 'axios';
import prisma from '../utils/prisma';

/**
 * DHL Paket API Service (Post & Parcel Germany)
 * 
 * Uses OAuth2.0 Password Grant Flow
 * Documentation: https://developer.dhl.com
 * 
 * Architecture:
 * - Your App: API Key + Secret (from developer.dhl.com)
 * - Customer: GKP Username + Password (Geschäftskundenportal)
 * - Combined: OAuth2.0 token for API access
 */

interface DHLConfig {
    gkpUsername: string;  // Customer's GKP username
    gkpPassword: string;  // Customer's GKP password
}

interface DHLAuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface ShippingLabelRequest {
    productCode: string;  // e.g. 'V01PAK' for DHL Paket
    weight: number;       // in grams
    recipient: {
        name: string;
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
        country?: string;
    };
    sender?: {
        name: string;
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
        country?: string;
    };
}

interface ShippingLabelResponse {
    trackingNumber: string;
    labelUrl: string;
    labelData: string;  // Base64 PDF
}

export class DHLParcelService {
    private apiKey: string;
    private apiSecret: string;
    private environment: 'sandbox' | 'production';
    private baseUrl: string;
    private tokenCache: Map<string, { token: DHLAuthToken; expiry: Date }> = new Map();

    constructor() {
        this.apiKey = process.env.DHL_API_KEY || '';
        this.apiSecret = process.env.DHL_API_SECRET || '';
        this.environment = (process.env.DHL_API_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';

        this.baseUrl = this.environment === 'sandbox'
            ? 'https://api-sandbox.dhl.com'
            : 'https://api-eu.dhl.com';

        if (!this.apiKey || !this.apiSecret) {
            console.warn('⚠️  DHL API credentials not configured. Please add DHL_API_KEY and DHL_API_SECRET to .env');
        }
    }

    /**
     * Authenticate with DHL API using OAuth2.0 Password Grant
     * Combines: Your App credentials + Customer's GKP credentials
     */
    async authenticate(config: DHLConfig): Promise<DHLAuthToken> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/parcel/de/account/auth/ropc/v1/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    username: config.gkpUsername,
                    password: config.gkpPassword,
                    client_id: this.apiKey,
                    client_secret: this.apiSecret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log('✅ DHL authentication successful');
            return response.data;
        } catch (error: any) {
            console.error('❌ DHL authentication failed:', error.response?.data || error.message);

            // User-friendly error messages
            if (error.response?.status === 401) {
                throw new Error('Ungültige GKP-Zugangsdaten. Bitte überprüfen Sie Ihren Geschäftskundenportal-Benutzernamen und Passwort.');
            } else if (error.response?.status === 403) {
                throw new Error('Zugriff verweigert. Bitte stellen Sie sicher, dass Ihr GKP-Konto für die API-Nutzung freigeschaltet ist.');
            } else {
                throw new Error(`DHL-Verbindung fehlgeschlagen: ${error.response?.data?.detail || error.message}`);
            }
        }
    }

    /**
     * Get valid access token (with caching and auto-refresh)
     */
    private async getValidToken(userId: string): Promise<string> {
        // Check cache
        const cached = this.tokenCache.get(userId);
        if (cached && cached.expiry > new Date()) {
            return cached.token.access_token;
        }

        // Fetch GKP credentials from database
        const settings = await prisma.userSettings.findUnique({
            where: { userId }
        });

        if (!settings?.dhlGkpUsername || !settings?.dhlGkpPassword) {
            throw new Error('DHL GKP-Zugangsdaten nicht konfiguriert. Bitte tragen Sie Ihren Geschäftskundenportal-Benutzernamen und Passwort in den Versandeinstellungen ein.');
        }

        // Authenticate
        const token = await this.authenticate({
            gkpUsername: settings.dhlGkpUsername,
            gkpPassword: settings.dhlGkpPassword
        });

        // Cache token
        const expiry = new Date(Date.now() + (token.expires_in * 1000) - 60000); // 1 min buffer
        this.tokenCache.set(userId, { token, expiry });

        return token.access_token;
    }

    /**
     * Create shipping label
     */
    async createLabel(userId: string, request: ShippingLabelRequest): Promise<ShippingLabelResponse> {
        try {
            const token = await this.getValidToken(userId);

            const response = await axios.post(
                `${this.baseUrl}/parcel/de/shipping/v2/orders`,
                {
                    profile: 'STANDARD_GRUPPENPROFIL',
                    shipments: [{
                        product: request.productCode,
                        billingNumber: '33333333330101', // Sandbox test billing number
                        refNo: `ORDER-${Date.now()}`,
                        shipDate: new Date().toISOString().split('T')[0],
                        shipper: request.sender || {
                            name1: 'Test Sender',
                            addressStreet: 'Teststr.',
                            addressHouse: '1',
                            postalCode: '12345',
                            city: 'Teststadt',
                            country: 'DEU'
                        },
                        consignee: {
                            name1: request.recipient.name,
                            addressStreet: request.recipient.street,
                            addressHouse: request.recipient.houseNumber,
                            postalCode: request.recipient.postalCode,
                            city: request.recipient.city,
                            country: request.recipient.country || 'DEU'
                        },
                        details: {
                            weight: {
                                uom: 'g',
                                value: request.weight
                            }
                        }
                    }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const shipment = response.data.items[0];

            console.log('✅ DHL label created:', shipment.shipmentNo);

            return {
                trackingNumber: shipment.shipmentNo,
                labelUrl: shipment.label?.url || '',
                labelData: shipment.label?.b64 || ''
            };
        } catch (error: any) {
            console.error('❌ Failed to create DHL label:', error.response?.data || error.message);
            throw new Error(`Label-Erstellung fehlgeschlagen: ${error.response?.data?.detail || error.message}`);
        }
    }

    /**
     * Test connection to DHL API
     */
    async testConnection(config: DHLConfig): Promise<{ success: boolean; error?: string }> {
        try {
            await this.authenticate(config);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get test credentials for sandbox
     */
    getSandboxTestCredentials() {
        return {
            gkpUsername: 'user-valid',
            gkpPassword: 'SandboxPasswort2023!',
            info: 'These are DHL sandbox test credentials. Use for testing only.'
        };
    }
}

export default new DHLParcelService();
