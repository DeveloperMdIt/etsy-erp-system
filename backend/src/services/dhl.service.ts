import axios from 'axios';
import { PrismaClient, ShippingProvider } from '@prisma/client';
import { CreateLabelRequest, DHLLabelResponse } from '../types/etsy-types';

const prisma = new PrismaClient();

export class DHLService {
    private baseUrl = 'https://api-eu.dhl.com/parcel/de/shipping/v2'; // DHL API v2 (Post & Parcel Germany)
    // Note: URL might vary depending on exact product (GK vs. P&P)
    // Using standard GK API endpoint structure as placeholder

    private getAuthHeader() {
        // Basic Auth is common for older DHL APIs, or API Key for newer ones.
        // Assuming Basic Auth with User/Signature for now as per common GK integration.
        const user = process.env.DHL_API_USER;
        const password = process.env.DHL_API_PASSWORD; // or Signature
        const token = Buffer.from(`${user}:${password}`).toString('base64');
        return {
            'Authorization': `Basic ${token}`,
            'dhl-api-key': process.env.DHL_API_KEY, // If using API Key
            'Content-Type': 'application/json'
        };
    }

    async createLabel(request: CreateLabelRequest): Promise<DHLLabelResponse> {
        const order = await prisma.order.findUnique({
            where: { id: request.orderId },
            include: { customer: true, items: { include: { product: true } } }
        });

        if (!order) throw new Error('Order not found');

        // Determine product and billing number
        let product = '';
        let billingNumber = '';

        if (request.productType === 'DHL_KLEINPAKET') {
            product = 'V06PAK'; // DHL Kleinpaket
            billingNumber = process.env.DHL_BILLING_NUMBER_KLEINPAKET || '';
        } else if (request.productType === 'DHL_PAKET') {
            product = 'V01PAK'; // DHL Paket
            billingNumber = process.env.DHL_BILLING_NUMBER_PAKET || '';
        } else {
            // Default or throw
            throw new Error(`Unsupported product type: ${request.productType}`);
        }

        if (!billingNumber) {
            throw new Error(`No billing number configured for ${request.productType}`);
        }

        const weight = request.weight || order.items.reduce((sum: number, item: any) => sum + (item.product.weight * item.quantity), 0);

        if (weight <= 0) throw new Error('Weight must be greater than 0');

        const payload = {
            "profile": "STANDARD_GRUPPENPROFIL",
            "shipments": [
                {
                    "product": product,
                    "billingNumber": billingNumber,
                    "refNo": order.orderNumber,
                    "shipper": {
                        "name1": process.env.SENDER_NAME || "My Shop",
                        "addressStreet": process.env.SENDER_STREET,
                        "postalCode": process.env.SENDER_ZIP,
                        "city": process.env.SENDER_CITY,
                        "country": "DEU",
                        "email": process.env.SENDER_EMAIL
                    },
                    "receiver": {
                        "name1": `${order.customer.firstName} ${order.customer.lastName}`,
                        "addressStreet": order.customer.street,
                        "additionalAddressInformation1": order.customer.addressAddition,
                        "postalCode": order.customer.postalCode,
                        "city": order.customer.city,
                        "country": "DEU" // Mapping needed for other countries
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
            // Mocking the call for now if no credentials
            if (!process.env.DHL_API_USER) {
                console.log('Mocking DHL API Call:', JSON.stringify(payload, null, 2));
                return {
                    shipmentNumber: 'TEST-' + Date.now(),
                    labelUrl: 'https://www.dhl.de/content/dam/images/pdf/dhl-versandschein-online.pdf',
                    labelData: 'base64-mock-data'
                };
            }

            const response = await axios.post(`${this.baseUrl}/orders`, payload, {
                headers: this.getAuthHeader()
            });

            const shipment = response.data.items[0];

            // Save label info to DB
            await prisma.shippingLabel.create({
                data: {
                    orderId: order.id,
                    provider: request.productType as ShippingProvider,
                    trackingNumber: shipment.shipmentNo,
                    labelUrl: shipment.label.url,
                    weight: weight,
                    cost: 0 // API usually doesn't return cost directly in this response
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
            console.error('DHL API Error:', error.response?.data || error.message);
            throw new Error(`DHL API Error: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }
}
