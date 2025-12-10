import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { EtsyOrderCSV, ImportResult } from '../types/etsy-types';
import SKUManagementService from './sku-management.service';
import NumberRangeService from './number-range.service';
import ImportStatusService from './import-status.service';

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

        try {
            const separator = await this.detectSeparator(filePath);
            console.log(`Detected CSV separator: '${separator}'`);

            // Reset status
            ImportStatusService.reset();
            ImportStatusService.start(0, 'Analyzing CSV file...');

            // First pass: Count lines for progress
            let totalRows = 0;
            const countStream = fs.createReadStream(filePath)
                .pipe(csv({ separator }))
                .on('data', () => totalRows++);

            await new Promise((resolve) => countStream.on('end', resolve));

            ImportStatusService.start(totalRows, 'Processing orders...');
            console.log(`Starting import of ${totalRows} rows...`);

            return await new Promise((resolve, reject) => {
                const stream = fs.createReadStream(filePath)
                    .pipe(csv({
                        separator,
                        mapHeaders: ({ header }) => header.trim().replace(/"/g, ''),
                        mapValues: ({ value }) => value ? value.trim().replace(/"/g, '') : value
                    }));

                stream.on('data', (data) => {
                    results.push(data);
                    ImportStatusService.increment();
                });

                stream.on('error', (error) => {
                    console.error('CSV Stream Error:', error);
                    ImportStatusService.error(error.message);
                    reject(error);
                });

                stream.on('end', async () => {
                    try {
                        console.log(`CSV Parsed. Total rows: ${results.length}. Starting processing...`);

                        // Check for valid user
                        let user = await prisma.user.findFirst({ where: { tenantId } });
                        if (!user) {
                            console.warn(`No user found for tenantId ${tenantId}. Trying fallback to first available user.`);
                            user = await prisma.user.findFirst();
                        }

                        if (!user) {
                            throw new Error(`No user found in database. Cannot import orders. Please create a user first.`);
                        }

                        const userId = user.id;

                        // Group by Order ID first
                        const ordersMap = new Map<string, EtsyOrderCSV[]>();

                        for (const row of results) {
                            const orderId = row['Order ID'];
                            if (!orderId) { continue; }
                            if (!ordersMap.has(orderId)) { ordersMap.set(orderId, []); }
                            ordersMap.get(orderId)?.push(row);
                        }

                        console.log(`Found ${ordersMap.size} unique orders.`);
                        ImportStatusService.start(ordersMap.size, 'Creating orders in database...');

                        // Sort orders by Date (Oldest first) to ensure correct number assignment
                        const sortedOrders = Array.from(ordersMap.entries()).sort((a, b) => {
                            const dateStrA = a[1][0]['Sale Date'];
                            const dateStrB = b[1][0]['Sale Date'];

                            // Log dates for debugging
                            if (Math.random() < 0.05) console.log(`Debug Sort: ${dateStrA} vs ${dateStrB}`);

                            const dateA = new Date(dateStrA).getTime();
                            const dateB = new Date(dateStrB).getTime();

                            // Handle invalid dates (treat as 0/oldest or Date.now/newest?)
                            // If invalid, fallback to 0
                            const validA = isNaN(dateA) ? 0 : dateA;
                            const validB = isNaN(dateB) ? 0 : dateB;

                            return validA - validB; // Ascending (Oldest first)
                        });

                        // Debug: Log the first and last order dates after sorting
                        if (sortedOrders.length > 0) {
                            console.log('--- SORT DEBUG ---');
                            console.log('First Order (Oldest?):', sortedOrders[0][0], sortedOrders[0][1][0]['Sale Date']);
                            console.log('Last Order (Newest?):', sortedOrders[sortedOrders.length - 1][0], sortedOrders[sortedOrders.length - 1][1][0]['Sale Date']);
                            console.log('------------------');
                        }

                        let processedOrders = 0;
                        for (const [orderId, rows] of sortedOrders) {
                            try {
                                ImportStatusService.increment(`Processing Order ${orderId}...`);
                                await this.processOrder(tenantId, userId, orderId, rows);
                                ordersCreated++;
                            } catch (err: any) {
                                console.error(`Error processing order ${orderId}:`, err);
                                errors.push(`Order ${orderId}: ${err.message}`);
                            }
                            processedOrders++;
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

                        ImportStatusService.complete(`Import finished. Processed ${ordersCreated} orders.`);

                        resolve({
                            success: true,
                            ordersCreated,
                            ordersUpdated,
                            errors,
                            fileName: filePath
                        });

                    } catch (error: any) {
                        ImportStatusService.error(error.message);
                        reject(error);
                    }
                });
            });

        } catch (error: any) {
            console.error("Import failed:", error);
            ImportStatusService.error(error.message);
            throw error;
        } finally {
            // Cleanup file
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.error('Failed to delete temp file:', e);
            }
        }
    }

    private async processOrder(tenantId: string, userId: string, etsyOrderId: string, rows: EtsyOrderCSV[]) {
        const firstRow = rows[0];

        // 1. Determine order status
        const etsyStatus = firstRow['Status'] || '';
        const dateShipped = firstRow['Date Shipped'] || '';
        const orderStatus = this.mapEtsyStatus(etsyStatus, dateShipped);
        const shippedAt = dateShipped && dateShipped.trim() !== '' ? new Date(dateShipped) : null;

        // Safe Name Parsing
        const fullName = firstRow['Full Name'] || firstRow['Ship Name'] || '';
        const nameParts = fullName.split(' ');
        const derivedFirstName = nameParts[0] || 'Unknown';
        const derivedLastName = nameParts.slice(1).join(' ') || 'Unknown';

        // Find or Create Customer
        const email = firstRow['Buyer User ID'] ? `${firstRow['Buyer User ID']}@etsy.placeholder.com` : `unknown-${etsyOrderId}@etsy.placeholder.com`;

        let customer = await prisma.customer.findFirst({
            where: {
                tenantId,
                OR: [
                    { email: email },
                    {
                        firstName: firstRow['First Name'] || derivedFirstName,
                        lastName: firstRow['Last Name'] || derivedLastName,
                        postalCode: firstRow['Ship Zipcode'] || firstRow['Zip']
                    }
                ]
            }
        });

        if (!customer) {
            const customerNumber = await NumberRangeService.generateNumber('CUSTOMER', userId);
            customer = await prisma.customer.create({
                data: {
                    tenantId,
                    customerNumber,
                    email,
                    firstName: firstRow['First Name'] || derivedFirstName,
                    lastName: firstRow['Last Name'] || derivedLastName,
                    street: firstRow['Street 1'] || firstRow['Ship Address1'] || firstRow['Ship Address 1'] || 'Unknown Street',
                    addressAddition: firstRow['Street 2'] || firstRow['Ship Address2'] || firstRow['Ship Address 2'],
                    postalCode: firstRow['Ship Zipcode'] || firstRow['Zip'],
                    city: firstRow['Ship City'] || firstRow['City'],
                    country: firstRow['Ship Country'] || firstRow['Country'],
                    isRepeatCustomer: false
                }
            });
        } else {
            if (!customer.isRepeatCustomer) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: { isRepeatCustomer: true }
                });
            }
        }

        // Check if Order exists
        // First try by external ID (preferred)
        let existingOrder = await prisma.order.findFirst({
            where: {
                tenantId,
                externalOrderId: etsyOrderId
            },
            include: { items: true }
        });

        // Fallback: Check by old orderNumber format (ETSY-...) for legacy compatibility
        if (!existingOrder) {
            existingOrder = await prisma.order.findUnique({
                where: { orderNumber: `ETSY-${etsyOrderId}` },
                include: { items: true }
            });
        }

        if (existingOrder) {
            if (existingOrder.items.length === 0) {
                await prisma.order.delete({ where: { id: existingOrder.id } });
            } else {
                if (orderStatus === OrderStatus.SHIPPED && existingOrder.status !== OrderStatus.SHIPPED) {
                    await prisma.order.update({
                        where: { id: existingOrder.id },
                        data: {
                            status: OrderStatus.SHIPPED,
                            shippedAt: shippedAt
                        }
                    });
                }
                return;
            }
        }

        // Create Order
        let totalPrice = this.parseGermanFloat(firstRow['Order Total'] || firstRow['Adjusted Order Total']);
        const shippingCost = this.parseGermanFloat(firstRow['Order Shipping'] || firstRow['Shipping']);

        if (totalPrice === 0 && rows.length > 0) {
            const itemsTotal = rows.reduce((sum, row) => sum + (this.parseGermanFloat(row['Price']) * parseInt(row['Quantity'] || '1')), 0);
            totalPrice = itemsTotal + shippingCost;
        }

        // Generate Internal Order Number
        const internalOrderNumber = await NumberRangeService.generateNumber('ORDER', userId);

        const order = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: internalOrderNumber, // Internal Number (e.g. BO-2025-001)
                externalOrderId: etsyOrderId,
                platform: 'ETSY',
                customerId: customer.id,
                status: orderStatus,
                totalPrice,
                shippingCost,
                shippedAt: shippedAt,
                notes: `Payment Method: ${firstRow['Payment Method']}`,
                createdAt: new Date(firstRow['Sale Date'] || Date.now())
            }
        });

        // Create Order Items
        for (const row of rows) {
            let sku = row['SKU']?.trim() || '';

            if (!sku) {
                try {
                    sku = await SKUManagementService.generateSKU(userId);
                } catch (e) {
                    sku = await this.generateNextSKU(tenantId);
                }
            }

            let product: any = null;
            // Try Maps/Variations if implemented, for now simple search
            const variant = await prisma.product_variations.findFirst({
                where: { sku: sku, product: { tenantId } },
                include: { product: true }
            });

            if (variant) {
                product = variant.product;
            } else {
                product = await prisma.product.findUnique({
                    where: { userId_sku: { userId: userId, sku } }
                });
            }

            if (!product) {
                const price = this.parseGermanFloat(row['Price']);
                product = await prisma.product.create({
                    data: {
                        userId: userId,
                        tenantId,
                        sku,
                        name: row['Item Name'] || row['Listing Title'] || 'Unknown Product',
                        description: row['Variation Details'],
                        price,
                        weight: 0
                    }
                });
            }

            const quantity = parseInt(row['Quantity'] || '1');
            const itemPrice = this.parseGermanFloat(row['Price']);

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

    private async generateNextSKU(tenantId: string): Promise<string> {
        return `GEN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    private mapEtsyStatus(status: string, dateShipped: string): OrderStatus {
        if (dateShipped && dateShipped.trim() !== '') return OrderStatus.SHIPPED;
        return OrderStatus.OPEN; // Default
    }

    private parseGermanFloat(value: string | undefined): number {
        if (!value) return 0;
        // Remove currency symbols and spaces
        let cleaned = value.replace(/[€$\s]/g, '');
        // Replace comma with dot if present
        cleaned = cleaned.replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    private async detectSeparator(filePath: string): Promise<string> {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(filePath, { start: 0, end: 1000 }); // Read first 1000 bytes
            let data = '';
            stream.on('data', (chunk) => data += chunk.toString());
            stream.on('end', () => {
                if (data.includes(';') && !data.includes(',')) resolve(';');
                else resolve(',');
            });
        });
    }
}
