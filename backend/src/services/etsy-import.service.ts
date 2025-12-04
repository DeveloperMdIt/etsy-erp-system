import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient, OrderStatus, ShippingProvider } from '@prisma/client';
import { EtsyOrderCSV, ImportResult } from '../types/etsy-types';

const prisma = new PrismaClient();

export class EtsyImportService {

    /**
     * Parse and import Etsy orders from a CSV file
     */
    async importOrdersFromCsv(filePath: string, tenantId: string): Promise<ImportResult> {
        const results: EtsyOrderCSV[] = [];
        const errors: string[] = [];
        let ordersCreated = 0;
        let ordersUpdated = 0;

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('error', (error) => {
                    reject(error);
                })
                .on('end', async () => {
                    try {
                        // Group by Order ID first to handle multiple items per order
                        const ordersMap = new Map<string, EtsyOrderCSV[]>();

                        for (const row of results) {
                            const orderId = row['Order ID'];
                            if (!orderId) continue;

                            if (!ordersMap.has(orderId)) {
                                ordersMap.set(orderId, []);
                            }
                            ordersMap.get(orderId)?.push(row);
                        }

                        for (const [orderId, rows] of ordersMap) {
                            try {
                                await this.processOrder(tenantId, orderId, rows);
                                ordersCreated++;
                            } catch (err: any) {
                                console.error(`Error processing order ${orderId}:`, err);
                                errors.push(`Order ${orderId}: ${err.message}`);
                            }
                        }

                        // Record import history
                        await prisma.importHistory.create({
                            data: {
                                tenantId,
                                fileName: filePath.split('/').pop() || 'unknown.csv',
                                ordersImported: ordersCreated,
                                status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
                                errorMessage: errors.length > 0 ? errors.join('; ').substring(0, 1000) : null
                            }
                        });

                        resolve({
                            success: true,
                            ordersCreated,
                            ordersUpdated,
                            errors,
                            fileName: filePath
                        });

                    } catch (error: any) {
                        reject(error);
                    } finally {
                        // Cleanup file
                        try {
                            fs.unlinkSync(filePath);
                        } catch (e) {
                            console.error('Failed to delete temp file:', e);
                        }
                    }
                });
        });
    }

    private async processOrder(tenantId: string, etsyOrderId: string, rows: EtsyOrderCSV[]) {
        const firstRow = rows[0]; // Main order details are same for all rows

        // 1. Determine order status from Etsy
        const etsyStatus = firstRow['Status'] || '';
        const dateShipped = firstRow['Date Shipped'] || '';
        const orderStatus = this.mapEtsyStatus(etsyStatus, dateShipped);
        const shippedAt = dateShipped && dateShipped.trim() !== '' ? new Date(dateShipped) : null;

        // 2. Find or Create Customer
        const email = firstRow['Buyer User ID'] ? `${firstRow['Buyer User ID']}@etsy.placeholder.com` : `unknown-${etsyOrderId}@etsy.placeholder.com`;

        let customer = await prisma.customer.findFirst({
            where: {
                tenantId,
                OR: [
                    { email: email },
                    { firstName: firstRow['First Name'], lastName: firstRow['Last Name'], postalCode: firstRow['Ship Zipcode'] }
                ]
            }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    tenantId,
                    email,
                    firstName: firstRow['First Name'] || firstRow['Full Name'].split(' ')[0] || 'Unknown',
                    lastName: firstRow['Last Name'] || firstRow['Full Name'].split(' ').slice(1).join(' ') || 'Unknown',
                    street: firstRow['Street 1'],
                    addressAddition: firstRow['Street 2'],
                    postalCode: firstRow['Ship Zipcode'],
                    city: firstRow['Ship City'],
                    country: firstRow['Ship Country'],
                    isRepeatCustomer: false
                }
            });
        } else {
            // Check if repeat customer
            if (!customer.isRepeatCustomer) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: { isRepeatCustomer: true }
                });
            }
        }

        // 3. Check if Order exists
        const existingOrder = await prisma.order.findUnique({
            where: { etsyOrderNumber: etsyOrderId },
            include: { items: true }
        });

        if (existingOrder) {
            // Update if status changed to SHIPPED
            if (orderStatus === OrderStatus.SHIPPED && existingOrder.status !== OrderStatus.SHIPPED) {
                await prisma.order.update({
                    where: { id: existingOrder.id },
                    data: {
                        status: OrderStatus.SHIPPED,
                        shippedAt: shippedAt
                    }
                });
            }
            // Skip further processing - order already exists
            return;
        }

        // 4. Create Order
        const totalPrice = parseFloat(firstRow['Order Total']?.replace(/[^\d.-]/g, '') || '0');
        const shippingCost = parseFloat(firstRow['Shipping']?.replace(/[^\d.-]/g, '') || '0');

        const order = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: `ETSY-${etsyOrderId}`,
                etsyOrderNumber: etsyOrderId,
                customerId: customer.id,
                status: orderStatus,
                totalPrice,
                shippingCost,
                shippedAt: shippedAt,
                notes: `Payment Method: ${firstRow['Payment Method']}`,
                createdAt: new Date(firstRow['Sale Date'] || Date.now())
            }
        });

        // 5. Create Order Items
        for (const row of rows) {
            // Find or Create Product
            const sku = row['SKU'] || `ETSY-${row['Listing ID']}`;
            let product = await prisma.product.findUnique({
                where: { tenantId_sku: { tenantId, sku } }
            });

            if (!product) {
                const price = parseFloat(row['Price']?.replace(/[^\d.-]/g, '') || '0');
                product = await prisma.product.create({
                    data: {
                        tenantId,
                        sku,
                        name: row['Listing Title'] || 'Unknown Product',
                        description: row['Variation Details'],
                        price,
                        weight: 0 // Default weight, needs to be maintained manually or guessed
                    }
                });
            }

            // Create Item
            const quantity = parseInt(row['Quantity'] || '1');
            const itemPrice = parseFloat(row['Price']?.replace(/[^\d.-]/g, '') || '0');

            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: product.id,
                    quantity,
                    price: itemPrice
                }
            });
        }
    }

    /**
     * Map Etsy status to internal OrderStatus
     */
    private mapEtsyStatus(status: string, dateShipped: string): OrderStatus {
        // If date shipped exists, it's shipped
        if (dateShipped && dateShipped.trim() !== '') {
            return OrderStatus.SHIPPED;
        }

        // Otherwise check status field
        const normalizedStatus = status.toLowerCase().trim();

        if (normalizedStatus.includes('completed') || normalizedStatus.includes('shipped')) {
            return OrderStatus.SHIPPED;
        }

        // Default to OPEN (Paid, Not Paid, etc.)
        return OrderStatus.OPEN;
    }
}
