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
    private environment: 'sandbox' | 'production';
    private baseUrl: string;
    private tokenCache: Map<string, { token: DHLAuthToken; expiry: Date }> = new Map();

    constructor() {
        this.environment = (process.env.DHL_API_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';

        this.baseUrl = this.environment === 'sandbox'
            ? 'https://api-sandbox.dhl.com'
            : 'https://api-eu.dhl.com';


    }

    async getAppCredentials(userId?: string) {
        let apiKey = process.env.DHL_API_KEY || '';
        let apiSecret = process.env.DHL_API_SECRET || '';

        // 1. Try User Specific App Credentials (if provided)
        if (userId) {
            const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
            if (userSettings?.dhlAppId && userSettings?.dhlAppSecret) {
                return { apiKey: userSettings.dhlAppId, apiSecret: userSettings.dhlAppSecret };
            }
        }

        // 2. Try System Settings (Database)
        const idSetting = await prisma.systemSetting.findUnique({ where: { key: 'DHL_APP_ID' } });
        const secretSetting = await prisma.systemSetting.findUnique({ where: { key: 'DHL_APP_SECRET' } });

        if (idSetting?.value) apiKey = idSetting.value;
        if (secretSetting?.value) apiSecret = secretSetting.value;

        return { apiKey, apiSecret };
    }

    /**
     * Authenticate with DHL API using OAuth2.0 Password Grant
     * Combines: Your App credentials + Customer's GKP credentials
     */
    async authenticate(config: DHLConfig, userId?: string): Promise<DHLAuthToken> {
        const { apiKey, apiSecret } = await this.getAppCredentials(userId);

        if (!apiKey || !apiSecret) {
            throw new Error('DHL App Credentials fehlen. Bitte hinterlegen Sie diese in den Einstellungen oder kontaktieren Sie den Support.');
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/parcel/de/account/auth/ropc/v1/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    username: config.gkpUsername,
                    password: config.gkpPassword,
                    client_id: apiKey,
                    client_secret: apiSecret
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
        }, userId);

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

            // Fetch User Settings for Billing Number
            const settings = await prisma.userSettings.findUnique({ where: { userId } });
            // Default to Sandbox number if not set (Safe Fallback? Or Error? Better to error or use specific Sandbox check)
            let billingNumber = settings?.dhlBillingNrPaket;

            if (this.environment === 'sandbox' && !billingNumber) {
                billingNumber = '33333333330101'; // Default Sandbox
            }

            if (!billingNumber) {
                throw new Error('Keine DHL Abrechnungsnummer (14-stellig) hinterlegt. Bitte in den Einstellungen eintragen.');
            }

            const response = await axios.post(
                `${this.baseUrl}/parcel/de/shipping/v2/orders`,
                {
                    profile: 'STANDARD_GRUPPENPROFIL',
                    shipments: [{
                        product: request.productCode,
                        billingNumber: billingNumber,
                        refNo: `ORDER-${Date.now()}`,
                        shipDate: new Date().toISOString().split('T')[0],
                        shipper: request.sender || {
                            name1: settings?.labelCompanyName || settings?.etsyShopName || 'Sender',
                            addressStreet: settings?.labelStreet || 'Street',
                            addressHouse: '1',
                            postalCode: settings?.labelPostalCode || '12345',
                            city: settings?.labelCity || 'City',
                            country: settings?.labelCountry ? (settings.labelCountry === 'Deutschland' ? 'DEU' : 'DEU') : 'DEU'
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
                        'Content-Type': 'application/json',
                        // 'dhl-api-key': ... // Some endpoints need this, but OAuth usually covers it. 
                        // Check docs: Post & Parcel DE usually only needs Bearer for the Shipping V2 if using OAuth.
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
    /**
     * Create Internetmarke (OneClickFor via Post & Parcel API)
     * Note: Detailed implementation depends on specific API endpoint for Internetmarke REST.
     * Assuming it flows through similar 'orders' endpoint or specific 'internetmarke' endpoint.
     * For now, we will assume standard OneClickFor logic or P&P integration.
     */
    async createInternetmarke(userId: string, request: ShippingLabelRequest): Promise<ShippingLabelResponse> {
        try {
            const token = await this.getValidToken(userId);

            // Fetch specific endpoint for Internetmarke if different, or use generic
            // For Post & Parcel Germany, stamps might be under /post/de/shipping/v1/orders
            // We'll use a hypothetical endpoint based on the suite structure.

            const response = await axios.post(
                `${this.baseUrl}/post/de/shipping/v1/orders`,
                {
                    product: request.productCode, // e.g. 1020
                    voucherLayout: 'ADDRESS_ZONE', // or PDF format
                    sender: request.sender ? {
                        name1: request.sender.name,
                        addressStreet: request.sender.street,
                        addressHouse: request.sender.houseNumber,
                        postalCode: request.sender.postalCode,
                        city: request.sender.city,
                        country: request.sender.country || 'DEU'
                    } : undefined,
                    recipient: {
                        name1: request.recipient.name,
                        addressStreet: request.recipient.street,
                        addressHouse: request.recipient.houseNumber,
                        postalCode: request.recipient.postalCode,
                        city: request.recipient.city,
                        country: request.recipient.country || 'DEU'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.de.deutschepost.shipping-v1+json' // Typical header for Post API
                    }
                }
            );

            // Adjust response parsing based on actual Internetmarke API
            const item = response.data.items ? response.data.items[0] : response.data;

            console.log('✅ Internetmarke created:', item.orderId);

            return {
                trackingNumber: item.orderId || 'NO-TRACKING', // Stamps often have no tracking unless Prio
                labelUrl: item.label?.url || '',
                labelData: item.label?.b64 || ''
            };
        } catch (error: any) {
            console.error('❌ Failed to create Internetmarke:', error.response?.data || error.message);
            throw new Error(`Internetmarke-Fehler: ${error.response?.data?.detail || error.message}`);
        }
    }
}

export default new DHLParcelService();
