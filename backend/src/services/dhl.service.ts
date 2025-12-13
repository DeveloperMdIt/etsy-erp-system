import axios from 'axios';
import { PrismaClient, ShippingProvider } from '@prisma/client';
import { CreateLabelRequest, DHLLabelResponse } from '../types/etsy-types';

const prisma = new PrismaClient();

export class DHLService {
    private baseUrl: string;

    constructor() {
        // Force Production or use Env
        const isSandbox = process.env.DHL_API_ENVIRONMENT === 'sandbox';
        // DHL Parcel DE Shipping V2 Base URL
        const sandboxUrl = 'https://api-sandbox.dhl.com/parcel/de/shipping/v2';
        const productionUrl = 'https://api-eu.dhl.com/parcel/de/shipping/v2';

        this.baseUrl = isSandbox ? sandboxUrl : productionUrl;

        console.log(`[DHL] Initialized Service in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
        console.log(`[DHL] Base URL: ${this.baseUrl}`);
    }

    private getAuthHeader(apiKey: string, user: string, pass: string) {
        // Basic Auth with GKP User/Pass + API Key
        // Detailed OAuth implementation pending correct endpoint verification, using Basic for transition/compatibility as User indicated "Basic Auth ist nur Übergang".
        // Using GKP credentials from DB.

        const token = Buffer.from(`${user}:${pass}`).toString('base64');
        return {
            'Authorization': `Basic ${token}`,
            'dhl-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async createLabel(request: CreateLabelRequest, tenantId: string): Promise<DHLLabelResponse> {
        // 1. Fetch Tenant Settings for Credentials
        const user = await prisma.user.findFirst({
            where: { tenantId }
        });

        if (!user) throw new Error('User not found for tenant');

        const settings = await prisma.userSettings.findUnique({
            where: { userId: user.id }
        });

        if (!settings || !settings.dhlEnabled) {
            throw new Error('DHL Shipping not enabled or configured for this user.');
        }

        // 2. Validate Credentials & Billing
        const appId = process.env.DHL_APP_ID;
        // User/Pass from DB (GKP)
        const gkpUser = settings.dhlGkpUsername;
        const gkpPass = settings.dhlGkpPassword;
        const ekp = settings.dhlEkp;

        if (!appId) throw new Error('System Configuration Error: DHL_APP_ID missing in backend env.');
        if (!gkpUser || !gkpPass) throw new Error('DHL GKP Credentials missing in Settings.');
        if (!ekp) throw new Error('DHL EKP missing in Settings.');

        // 3. Determine Product & Billing Number
        const billingNrPaket = settings.dhlBillingNrPaket || (ekp + settings.dhlProcedure + settings.dhlParticipation);
        const billingNrKlein = settings.dhlBillingNrKleinpaket || billingNrPaket; // Fallback

        const order = await prisma.order.findUnique({
            where: { id: request.orderId },
            include: { customer: true, items: { include: { product: true } } }
        });

        if (!order) throw new Error('Order not found');

        let product = '';
        let billingNumber = '';

        if (request.productType === 'DHL_KLEINPAKET') {
            product = 'V06PAK';
            billingNumber = billingNrKlein;
        } else if (request.productType === 'DHL_PAKET') {
            product = 'V01PAK';
            billingNumber = billingNrPaket;
        } else {
            throw new Error(`Unsupported product type: ${request.productType}`);
        }

        if (!billingNumber || billingNumber.length < 14) {
            throw new Error(`Invalid Billing Number: ${billingNumber}. Check EKP/Verfahren/Teilnahme in Settings.`);
        }

        const weight = request.weight || order.items.reduce((sum: number, item: any) => sum + (item.product.weight * item.quantity), 0);
        if (weight <= 0) throw new Error('Weight must be greater than 0');

        // 4. Construct Payload
        const payload = {
            "profile": "STANDARD_GRUPPENPROFIL",
            "shipments": [
                {
                    "product": product,
                    "billingNumber": billingNumber,
                    "refNo": order.orderNumber,
                    "shipper": {
                        "name1": settings.labelCompanyName || process.env.SENDER_NAME || "Shop",
                        "addressStreet": settings.labelStreet || process.env.SENDER_STREET,
                        "postalCode": settings.labelPostalCode || process.env.SENDER_ZIP,
                        "city": settings.labelCity || process.env.SENDER_CITY,
                        "country": "DEU",
                        "email": settings.labelEmail || process.env.SENDER_EMAIL
                    },
                    "receiver": {
                        "name1": `${order.customer.firstName} ${order.customer.lastName}`,
                        "addressStreet": order.customer.street,
                        "additionalAddressInformation1": order.customer.addressAddition,
                        "postalCode": order.customer.postalCode,
                        "city": order.customer.city,
                        "country": "DEU" // TODO: Map Country Codes
                    },
                    "details": {
                        "dim": {
                            "uom": "mm",
                            "height": 100,
                            "length": 200,
                            "width": 150
                        },
                        "weight": {
                            "uom": "g",
                            "value": weight
                        }
                    }
                }
            ]
        };

        try {
            console.log(`[DHL] Creating label for ${order.orderNumber} with Billing: ${billingNumber}`);

            const response = await axios.post(`${this.baseUrl}/orders`, payload, {
                headers: this.getAuthHeader(appId, gkpUser, gkpPass)
            });

            const shipment = response.data.items[0];

            // Check for API warnings/validation errors even in success 200/207
            if (shipment.sstatus?.statusCode && shipment.sstatus.statusCode >= 2000) {
                console.warn('[DHL] API Warning:', shipment.sstatus);
            }

            // Save label info to DB
            await prisma.shippingLabel.create({
                data: {
                    orderId: order.id,
                    provider: request.productType as ShippingProvider,
                    trackingNumber: shipment.shipmentNo,
                    labelUrl: shipment.label.url,
                    weight: weight,
                    cost: 0
                }
            });

            // Update Order Status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'SHIPPED',
                    trackingNumber: shipment.shipmentNo,
                    shippingProvider: request.productType as ShippingProvider
                }
            });

            return {
                shipmentNumber: shipment.shipmentNo,
                labelUrl: shipment.label.url,
                labelData: shipment.label.b64
            };

        } catch (error: any) {
            const dhlError = error.response?.data || error.message;
            console.error('DHL API Error:', JSON.stringify(dhlError, null, 2));

            // Enhanced Error Parsing
            let cleanMsg = error.message;
            if (error.response?.data?.detail) cleanMsg = error.response.data.detail;
            if (error.response?.data?.title) cleanMsg = `${error.response.data.title}: ${cleanMsg}`;

            throw new Error(JSON.stringify(dhlError)); // Return full object for UI Modal
        }
    }
}
