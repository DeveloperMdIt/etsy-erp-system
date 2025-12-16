import axios from 'axios';
import prisma from '../utils/prisma';

/**
 * DHL Paket API Service (Post & Parcel Germany)
 * 
 * Uses OAuth2.0 Password Grant Flow
 * Documentation: https://developer.dhl.com
 */

interface DHLConfig {
    gkpUsername: string;
    gkpPassword: string;
}

interface DHLAuthToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface ShippingLabelRequest {
    productCode: string;
    weight: number;
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
    labelData: string;
}

export class DHLParcelService {
    private environment: 'sandbox' | 'production';
    private tokenCache: Map<string, { token: DHLAuthToken; expiry: Date }> = new Map();

    constructor() {
        this.environment = (process.env.DHL_API_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    }

    private getBaseUrl(isProduction: boolean): string {
        return isProduction
            ? 'https://api-eu.dhl.com'
            : 'https://api-sandbox.dhl.com';
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
     * Authenticate with DHL API
     */
    async authenticate(config: DHLConfig, userId?: string, customAppId?: string, customAppSecret?: string): Promise<DHLAuthToken> {
        let { apiKey, apiSecret } = await this.getAppCredentials(userId);

        if (customAppId && customAppSecret) {
            apiKey = customAppId;
            apiSecret = customAppSecret;
        }

        if (!apiKey || !apiSecret) {
            throw new Error('DHL App Credentials fehlen. Bitte hinterlegen Sie diese in den Einstellungen oder nutzen Sie den Sandbox-Modus.');
        }

        // 3. Determine Environment Logic
        // IF we have specific credentials (custom passed OR found in DB/System), 
        // AND they are NOT explicitly known to be Sandbox defaults (optional check),
        // THEN we assume Production intent, unless env var explicitly forces 'sandbox'.

        let isProduction = false;

        if (customAppId) {
            isProduction = true; // Manual override = Prod intent
        } else if (process.env.DHL_API_ENVIRONMENT === 'production') {
            isProduction = true;
        } else if (apiKey && apiKey !== process.env.DHL_API_KEY) {
            // The key came from DB (User or System) and is NOT the default env key (if any). Assume Prod.
            // Even if process.env.DHL_API_KEY is undefined, apiKey will be something if found in DB.
            // If apiKey came from process.env.DHL_API_KEY, this condition is false (Sandbox).
            isProduction = true;
        }

        const baseUrl = this.getBaseUrl(isProduction);

        try {
            const response = await axios.post(
                `${baseUrl}/parcel/de/account/auth/ropc/v1/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    username: config.gkpUsername,
                    password: config.gkpPassword,
                    client_id: apiKey,
                    client_secret: apiSecret
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );

            console.log(`✅ DHL authentication successful (${isProduction ? 'Production' : 'Sandbox'})`);
            return response.data;
        } catch (error: any) {
            console.error('❌ DHL authentication failed:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                throw new Error('Ungültige GKP-Zugangsdaten. Bitte überprüfen Sie Ihren Geschäftskundenportal-Benutzernamen und Passwort.');
            } else if (error.response?.status === 403) {
                throw new Error('Zugriff verweigert. Bitte stellen Sie sicher, dass Ihr GKP-Konto für die API-Nutzung freigeschaltet ist.');
            } else {
                throw new Error(`DHL-Verbindung fehlgeschlagen: ${error.response?.data?.detail || error.message}`);
            }
        }
    }

    private async getValidToken(userId: string, customAppId?: string, customAppSecret?: string): Promise<string> {
        const cached = this.tokenCache.get(userId);
        if (cached && cached.expiry > new Date()) {
            return cached.token.access_token;
        }

        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (!settings?.dhlGkpUsername || !settings?.dhlGkpPassword) {
            throw new Error('DHL GKP-Zugangsdaten nicht konfiguriert.');
        }

        const token = await this.authenticate({
            gkpUsername: settings.dhlGkpUsername,
            gkpPassword: settings.dhlGkpPassword
        }, userId, customAppId || settings.dhlAppId || undefined, customAppSecret || settings.dhlAppSecret || undefined);

        const expiry = new Date(Date.now() + (token.expires_in * 1000) - 60000);
        this.tokenCache.set(userId, { token, expiry });

        return token.access_token;
    }

    async createLabel(userId: string, request: ShippingLabelRequest): Promise<ShippingLabelResponse> {
        const settings = await prisma.userSettings.findUnique({ where: { userId } });

        // Determine Environment Logic (same as authenticate)
        let { apiKey } = await this.getAppCredentials(userId);

        let isProduction = false;
        if (settings?.dhlAppId || process.env.DHL_API_ENVIRONMENT === 'production') {
            isProduction = true;
        } else if (apiKey && apiKey !== process.env.DHL_API_KEY) {
            isProduction = true;
        }

        const baseUrl = this.getBaseUrl(isProduction);

        const token = await this.getValidToken(userId, settings?.dhlAppId || undefined, settings?.dhlAppSecret || undefined);

        let billingNumber = settings?.dhlBillingNrPaket;
        if (!isProduction && !billingNumber) {
            billingNumber = '33333333330101';
        }

        if (!billingNumber) throw new Error('Keine DHL Abrechnungsnummer hinterlegt.');

        try {
            const response = await axios.post(
                `${baseUrl}/parcel/de/shipping/v2/orders`,
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
                            weight: { uom: 'g', value: request.weight }
                        }
                    }]
                },
                {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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

    async testConnection(config: DHLConfig, userId?: string, appId?: string, appSecret?: string): Promise<{ success: boolean; error?: string }> {
        try {
            await this.authenticate(config, userId, appId, appSecret);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    getSandboxTestCredentials() {
        return {
            gkpUsername: 'user-valid',
            gkpPassword: 'SandboxPasswort2023!',
            info: 'These are DHL sandbox test credentials.'
        };
    }

    async createInternetmarke(userId: string, request: ShippingLabelRequest): Promise<ShippingLabelResponse> {
        try {
            const settings = await prisma.userSettings.findUnique({ where: { userId } });

            let { apiKey } = await this.getAppCredentials(userId);

            let isProduction = false;
            if (settings?.dhlAppId || process.env.DHL_API_ENVIRONMENT === 'production') {
                isProduction = true;
            } else if (apiKey && apiKey !== process.env.DHL_API_KEY) {
                isProduction = true;
            }

            const baseUrl = this.getBaseUrl(isProduction);

            const token = await this.getValidToken(userId, settings?.dhlAppId || undefined, settings?.dhlAppSecret || undefined);

            const response = await axios.post(
                `${baseUrl}/post/de/shipping/v1/orders`,
                {
                    product: request.productCode,
                    voucherLayout: 'ADDRESS_ZONE',
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
                        'Accept': 'application/vnd.de.deutschepost.shipping-v1+json'
                    }
                }
            );

            const item = response.data.items ? response.data.items[0] : response.data;
            console.log('✅ Internetmarke created:', item.orderId);

            return {
                trackingNumber: item.orderId || 'NO-TRACKING',
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
