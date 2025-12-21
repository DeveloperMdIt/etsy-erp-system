import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { EtsyOrderCSV, ImportResult } from '../types/etsy-types';
import SKUManagementService from './sku-management.service';
import NumberRangeService from './number-range.service';
import ImportStatusService from './import-status.service';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';
import etsyTrackingService from './etsy-tracking.service';

const prisma = new PrismaClient();

export class EtsyImportService {

    async importOrdersFromApi(orders: any[], tenantId: string, userId: string): Promise<ImportResult> {
        let ordersCreated = 0;
        let ordersUpdated = 0;
        const errors: string[] = [];

        try {
            ImportStatusService.start(tenantId, orders.length, 'Processing API Orders...');
            console.log(`[Import] Processing ${orders.length} orders from API...`);

            // Sort orders (Oldest First) to ensure correct Order Number chronology
            orders.sort((a, b) => (a.created_timestamp || 0) - (b.created_timestamp || 0));

            // Process each receipt
            for (const receipt of orders) {
                try {
                    await this.processApiOrder(tenantId, userId, receipt);
                    ordersCreated++;
                    ImportStatusService.increment(tenantId);
                } catch (err: any) {
                    console.error(`Failed to import receipt ${receipt.receipt_id}`, err);
                    errors.push(`Receipt ${receipt.receipt_id}: ${err.message}`);
                }
            }

            ImportStatusService.complete(tenantId, `API Import finished. Processed ${ordersCreated}.`);

            // Log Success
            await ActivityLogService.log(
                errors.length === 0 ? LogType.SUCCESS : LogType.WARNING,
                LogAction.IMPORT_ORDERS,
                `Auto-Import Finished: ${ordersCreated} processed.`,
                userId,
                tenantId,
                { source: 'API', count: ordersCreated, errors }
            );

            return { success: true, ordersCreated, ordersUpdated, errors, fileName: 'API' };

        } catch (error: any) {
            console.error('API Import Failed:', error);
            ImportStatusService.error(tenantId, error.message);
            throw error;
        }
    }

    /**
     * Fetch full product details for a single listing and update/create in DB.
     * Used for lazy-loading when an order contains a product we don't know well yet.
     */
    async importProductDetails(userId: string, tenantId: string, listingId: string): Promise<any> {
        const { EtsyApiService } = await import('./etsy-api.service');
        try {
            // 1. Fetch from Etsy
            const listing = await EtsyApiService.fetchListingDetails(userId, listingId);
            if (!listing) return null;

            // 2. Upsert Product
            const price = listing.price ? (listing.price.amount / listing.price.divisor) : 0;
            const sku = listing.skus?.[0] || listing.listing_id.toString(); // Use first SKU or ID

            const productData = {
                name: listing.title || 'Unbekanntes Produkt',
                description: listing.description || '',
                price: price,
                images: listing.images ? JSON.stringify(listing.images.map((img: any) => img.url_fullxfull)) : null,
                imageUrl: listing.images?.[0]?.url_fullxfull || null,
                weight: listing.item_weight ? parseFloat(listing.item_weight) : 0,
                sku: sku
            };

            const existing = await prisma.product.findFirst({
                where: { tenantId, sku }
            });

            if (existing) {
                return await prisma.product.update({
                    where: { id: existing.id },
                    data: productData
                });
            } else {
                return await prisma.product.create({
                    data: {
                        ...productData,
                        userId,
                        tenantId,
                        sku
                    }
                });
            }
        } catch (error) {
            console.error(`[Lazy Load] Failed to fetch product details for Listing ${listingId}`, error);
            return null;
        }
    }

    private async processApiOrder(tenantId: string, userId: string, receipt: any) {
        // ... (existing customer/order logic remains same, skipping to Item loop for brevity in diff if possible, but I must replace full block or carefully target)
        // RE-IMPLEMENTING processApiOrder to include the hook.

        // 1. Find/Create Customer
        let email = receipt.buyer_email;
        if (!email) {
            email = `${receipt.buyer_user_id}@etsy.placeholder.com`;
        }

        // Address Extraction
        // DEBUG: Force log for the first few receipts to debug address issues
        if (Math.random() < 0.1 || receipt.name === 'Micha') {
            console.log(`[Etsy Import] Debug Receipt for ${receipt.name}:`);
            console.log(JSON.stringify(receipt, null, 2));
        }

        // SPLIT NAME LOGIC
        const rawName = receipt.name || 'Unknown';
        const nameParts = rawName.split(' ');
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : rawName;
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // If simple 2-part name, split cleanly. If complex, keep first part as First, rest as Last?
        // Actually, standard is often: First Last. So:
        // "Nicole Friedel" -> First: "Nicole", Last: "Friedel"
        // "Dr. Max Mustermann" -> First: "Dr. Max", Last: "Mustermann"
        // Let's rely on space splitting.

        let street = receipt.first_line;
        let city = receipt.city;
        let zip = receipt.zip;
        let country = receipt.country_iso;

        // Formatted Address Fallback
        if (!street && receipt.formatted_address) {
            const lines = receipt.formatted_address.split('\n');
            street = lines[0];
            if (lines.length > 1) city = lines[1];
        }

        const customerAddress = {
            firstName: firstName,
            lastName: lastName,
            street: street || 'Unknown',
            city: city || 'Unknown',
            postalCode: zip || '00000',
            country: country || 'DE'
        };

        let customer = await prisma.customer.findFirst({
            where: { tenantId, email }
        });

        if (!customer) {
            const customerNumber = await NumberRangeService.generateNumber('CUSTOMER', userId);
            customer = await prisma.customer.create({
                data: {
                    tenantId,
                    customerNumber,
                    email,
                    ...customerAddress
                }
            });
        } else {
            // Update address if we found better data and existing is placeholder
            const isUnknown = customer.street === 'Unknown' || customer.street === 'Unknown Street';
            const weHaveData = street && street !== 'Unknown';
            if (isUnknown && weHaveData) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        firstName: customerAddress.firstName,
                        street: customerAddress.street,
                        city: customerAddress.city,
                        postalCode: customerAddress.postalCode,
                        country: customerAddress.country
                    }
                });
            }
        }

        // 2. Check/Create Order
        const externalOrderId = receipt.receipt_id.toString();
        let order = await prisma.order.findFirst({
            where: { tenantId, externalOrderId },
            include: { items: true }
        });

        // Transactions
        const transactions = receipt.transactions || [];

        let newStatus: OrderStatus = receipt.is_shipped ? OrderStatus.SHIPPED : OrderStatus.OPEN;
        // Tracking info extraction
        let trackingNumber: string | null = null;
        let shippedAt: Date | null = null;

        if (receipt.shipments && receipt.shipments.length > 0) {
            trackingNumber = receipt.shipments[0].tracking_code;
            if (receipt.shipments[0].shipment_notification_timestamp) {
                shippedAt = new Date(receipt.shipments[0].shipment_notification_timestamp * 1000);
            }
        }
        if (!shippedAt && receipt.shipped_timestamp) {
            shippedAt = new Date(receipt.shipped_timestamp * 1000);
        }

        if (trackingNumber && newStatus !== OrderStatus.SHIPPED) {
            newStatus = OrderStatus.SHIPPED;
        }
        if (receipt.status && receipt.status.toLowerCase() === 'canceled') {
            newStatus = OrderStatus.CANCELLED;
        }

        if (order) {
            // Update status logic
            const updateData: any = {};
            let needsUpdate = false;

            if (order.status !== newStatus && order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.CANCELLED) {
                if (newStatus === OrderStatus.SHIPPED) {
                    updateData.status = newStatus;
                    updateData.shippedAt = shippedAt || new Date();
                    needsUpdate = true;
                }
            }
            if (trackingNumber && order.trackingNumber !== trackingNumber) {
                updateData.trackingNumber = trackingNumber;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await prisma.order.update({
                    where: { id: order.id },
                    data: updateData
                });
            }
            return; // Order exists, stop here (or should we still check items? user usually asks for order sync to fetch missing orders, not update existing items)
        }

        // Create Order
        const orderDate = new Date(receipt.created_timestamp * 1000);
        const internalOrderNumber = await NumberRangeService.generateNumber('ORDER', userId, orderDate);

        const createdOrder = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: internalOrderNumber,
                externalOrderId,
                platform: 'ETSY',
                customerId: customer.id,
                status: newStatus,
                totalPrice: (receipt.total_price?.amount / receipt.total_price?.divisor) || 0,
                shippingCost: (receipt.total_shipping_cost?.amount / receipt.total_shipping_cost?.divisor) || 0,
                createdAt: orderDate,
                trackingNumber: trackingNumber,
                shippedAt: newStatus === OrderStatus.SHIPPED ? (shippedAt || new Date()) : null
            }
        });

        // 3. Create Items & Lazy Load Products
        for (const tx of transactions) {
            try {
                const price = (tx.price?.amount / tx.price?.divisor) || 0;
                // Prefer SKU from transaction, else use Listing ID
                let sku = tx.sku;
                if (!sku && tx.listing_id) {
                    sku = tx.listing_id.toString();
                }
                if (!sku) {
                    sku = await SKUManagementService.generateSKU(userId);
                }

                let product = await prisma.product.findFirst({
                    where: { tenantId, sku }
                });

                // LAZY LOAD: If product is missing OR it looks like a temporary placeholder (empty description/images), fetch from Etsy
                // We check 'listing_id' from transaction to fetch details
                const listingId = tx.listing_id;

                if (listingId && (!product || !product.description)) {
                    console.log(`[Import] Lazy-loading product details for Listing ${listingId} (SKU: ${sku})...`);
                    const importedProduct = await this.importProductDetails(userId, tenantId, listingId);
                    if (importedProduct) {
                        product = importedProduct;
                    }
                }

                // If still no product (fetch failed?), create a basic one from Transaction data
                if (!product) {
                    product = await prisma.product.create({
                        data: {
                            userId,
                            tenantId,
                            sku,
                            name: tx.title,
                            price,
                            weight: 0,
                            description: 'Auto-created from Order'
                        }
                    });
                }

                await prisma.orderItem.create({
                    data: {
                        orderId: createdOrder.id,
                        productId: product.id,
                        quantity: tx.quantity,
                        price
                    }
                });
            } catch (itemErr: any) {
                console.error(`[Etsy Import ERROR] Failed to create item for Order ${externalOrderId}:`, itemErr);
            }
        }
    }

    async importProductsFromApi(userId: string, tenantId: string) {
        const { EtsyApiService } = await import('./etsy-api.service');
        const ImportStatusService = (await import('./import-status.service')).default;
        const SKUManagementService = (await import('./sku-management.service')).default;

        try {
            const products = await EtsyApiService.fetchProducts(userId);

            let imported = 0;
            let updated = 0;
            const errors: string[] = [];

            if (!products || products.length === 0) {
                ImportStatusService.complete(tenantId, 'Keine Produkte gefunden.');
                return { imported, updated, errors };
            }

            ImportStatusService.start(tenantId, products.length, 'Starte Produkt-Import...');

            for (const etsyListing of products) {
                try {
                    const listingId = etsyListing.listing_id.toString();

                    // 1. Determine SKU
                    let sku = '';
                    if (etsyListing.skus && etsyListing.skus.length > 0 && etsyListing.skus[0]) {
                        sku = etsyListing.skus[0];
                    }

                    // 2. Try to find existing product by Etsy Listing ID (Best Match)
                    let existing = await prisma.product.findFirst({
                        where: { tenantId, etsyListingId: listingId }
                    });

                    // 3. Fallback: Find by SKU if we have one (Legacy Match)
                    if (!existing && sku) {
                        existing = await prisma.product.findFirst({
                            where: { tenantId, sku }
                        });
                        // Found legacy product by SKU, will link it in update
                    }

                    // 4. Generate SKU if missing
                    if (!sku) {
                        if (existing) {
                            sku = existing.sku; // Keep existing
                        } else {
                            // Generate new SKU only for new products
                            sku = await SKUManagementService.generateSKU(userId);
                        }
                    }

                    const price = etsyListing.price ? (etsyListing.price.amount / etsyListing.price.divisor) : 0;

                    const data = {
                        name: etsyListing.title || 'Unbekanntes Produkt',
                        description: etsyListing.description || '',
                        price,
                        weight: etsyListing.item_weight ? parseFloat(etsyListing.item_weight) : 0,
                        sku,
                        etsyListingId: listingId,
                        imageUrl: etsyListing.images?.[0]?.url_fullxfull || null,
                        images: etsyListing.images ? JSON.stringify(etsyListing.images.map((img: any) => img.url_fullxfull)) : null
                    };

                    if (existing) {
                        await prisma.product.update({ where: { id: existing.id }, data });
                        updated++;
                    } else {
                        await prisma.product.create({
                            data: { ...data, userId, tenantId }
                        });
                        imported++;
                    }

                    ImportStatusService.increment(tenantId, `Importiere ${etsyListing.title?.substring(0, 20)}...`);

                } catch (err: any) {
                    errors.push(`Listing ${etsyListing.listing_id}: ${err.message}`);
                }
            }

            const resultMsg = `${imported} neu, ${updated} aktualisiert.`;
            ImportStatusService.complete(tenantId, resultMsg);

            return { imported, updated, errors };

        } catch (error: any) {
            console.error('Fatal Import Error:', error);
            ImportStatusService.error(tenantId, error.message);
            throw error;
        }
    }

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

            ImportStatusService.reset(tenantId);
            ImportStatusService.start(tenantId, 0, 'Analyzing CSV file...');

            let totalRows = 0;
            const countStream = fs.createReadStream(filePath)
                .pipe(csv({ separator }))
                .on('data', () => totalRows++);

            await new Promise((resolve) => countStream.on('end', resolve));

            ImportStatusService.start(tenantId, totalRows, 'Processing orders...');
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
                    ImportStatusService.increment(tenantId);
                });

                stream.on('error', (error) => {
                    console.error('CSV Stream Error:', error);
                    ImportStatusService.error(tenantId, error.message);
                    reject(error);
                });

                stream.on('end', async () => {
                    try {
                        console.log(`CSV Parsed. Total rows: ${results.length}. Starting processing...`);

                        let user = await prisma.user.findFirst({ where: { tenantId } });
                        if (!user) {
                            console.warn(`No user found for tenantId ${tenantId}. Trying fallback to first available user.`);
                            user = await prisma.user.findFirst();
                        }

                        if (!user) {
                            throw new Error(`No user found in database. Cannot import orders. Please create a user first.`);
                        }

                        const userId = user.id;

                        const ordersMap = new Map<string, EtsyOrderCSV[]>();

                        for (const row of results) {
                            const orderId = row['Order ID'];
                            if (!orderId) { continue; }
                            if (!ordersMap.has(orderId)) { ordersMap.set(orderId, []); }
                            ordersMap.get(orderId)?.push(row);
                        }

                        console.log(`Found ${ordersMap.size} unique orders.`);
                        ImportStatusService.start(tenantId, ordersMap.size, 'Creating orders in database...');

                        const sortedOrders = Array.from(ordersMap.entries()).sort((a, b) => {
                            const dateStrA = a[1][0]['Sale Date'];
                            const dateStrB = b[1][0]['Sale Date'];
                            const dateA = new Date(dateStrA).getTime();
                            const dateB = new Date(dateStrB).getTime();
                            const validA = isNaN(dateA) ? 0 : dateA;
                            const validB = isNaN(dateB) ? 0 : dateB;
                            return validA - validB;
                        });

                        for (const [orderId, rows] of sortedOrders) {
                            try {
                                ImportStatusService.increment(tenantId, `Processing Order ${orderId}...`);
                                await this.processOrder(tenantId, userId, orderId, rows);
                                ordersCreated++;
                            } catch (err: any) {
                                console.error(`Error processing order ${orderId}:`, err);
                                errors.push(`Order ${orderId}: ${err.message}`);
                            }
                        }

                        await prisma.importHistory.create({
                            data: {
                                tenantId,
                                fileName: filePath.split('/').pop() || 'unknown.csv',
                                ordersImported: ordersCreated,
                                status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
                                errorMessage: errors.length > 0 ? errors.join('; ').substring(0, 1000) : null
                            }
                        });

                        ImportStatusService.complete(tenantId, `Import finished. Processed ${ordersCreated} orders.`);

                        await ActivityLogService.log(
                            errors.length === 0 ? LogType.SUCCESS : LogType.WARNING,
                            LogAction.IMPORT_ORDERS,
                            `Etsy Import Finished: ${ordersCreated} created, ${ordersUpdated} updated.`,
                            userId,
                            tenantId,
                            {
                                ordersCreated,
                                ordersUpdated,
                                errors,
                                fileName: filePath.split('/').pop()
                            }
                        );

                        resolve({
                            success: true,
                            ordersCreated,
                            ordersUpdated,
                            errors,
                            fileName: filePath
                        });

                    } catch (error: any) {
                        ImportStatusService.error(tenantId, error.message);
                        reject(error);
                    }
                });
            });

        } catch (error: any) {
            console.error("Import failed:", error);
            ImportStatusService.error(tenantId, error.message);

            await ActivityLogService.log(
                LogType.ERROR,
                LogAction.IMPORT_ORDERS,
                `Etsy Import Failed: ${error.message}`,
                undefined,
                tenantId,
                { fileName: filePath.split('/').pop(), error: error.message }
            );

            throw error;
        } finally {
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

        const etsyStatus = firstRow['Status'] || '';
        const dateShipped = firstRow['Date Shipped'] || '';
        const orderStatus = this.mapEtsyStatus(etsyStatus, dateShipped);
        const shippedAt = dateShipped && dateShipped.trim() !== '' ? new Date(dateShipped) : null;

        const fullName = firstRow['Full Name'] || firstRow['Ship Name'] || '';
        const nameParts = fullName.split(' ');
        const derivedFirstName = nameParts[0] || 'Unknown';
        const derivedLastName = nameParts.slice(1).join(' ') || 'Unknown';

        const email = firstRow['Buyer User ID'] ? `${firstRow['Buyer User ID']}@etsy.placeholder.com` : `unknown-${etsyOrderId}@etsy.placeholder.com`;

        // 1. IMPROVED CUSTOMER DEDUPLICATION
        // First try strict match by Email or Name+Zip
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

        // 2. Fuzzy Match Fallback: If no strict match, look for same Name but "Unknown/00000" address (created by API)
        if (!customer) {
            const potentialMatches = await prisma.customer.findMany({
                where: {
                    tenantId,
                    OR: [
                        // Case A: First/Last match CSV First/Last
                        {
                            firstName: firstRow['First Name'] || derivedFirstName,
                            lastName: firstRow['Last Name'] || derivedLastName,
                        },
                        // Case B: Database has Full Name in FirstName (old API Import behavior)
                        {
                            firstName: fullName, // e.g. "Nicole Friedel"
                            // lastName might be empty
                        }
                    ]
                }
            });

            // Find a match that looks like a placeholder
            customer = potentialMatches.find(c =>
                c.postalCode === '00000' ||
                c.street === 'Unknown' ||
                c.street === 'Unknown Street' ||
                c.email.includes('@etsy.placeholder.com')
            ) || null;
        }

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
            // Update customer with better data if current is placeholder
            const isPlaceholder = customer.postalCode === '00000' || customer.street === 'Unknown' || customer.email.includes('unknown-');
            if (isPlaceholder) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        street: firstRow['Street 1'] || firstRow['Ship Address1'] || firstRow['Ship Address 1'] || customer.street,
                        postalCode: firstRow['Ship Zipcode'] || firstRow['Zip'] || customer.postalCode,
                        city: firstRow['Ship City'] || firstRow['City'] || customer.city,
                        country: firstRow['Ship Country'] || firstRow['Country'] || customer.country,
                        // Update email if the current one is an ID-placeholder but we might have a better one? 
                        // Actually CSV usually lacks email too, but if it had it, we'd want it.
                        // For now just address.
                    }
                });
            }
            if (!customer.isRepeatCustomer) {
                await prisma.customer.update({
                    where: { id: customer.id },
                    data: { isRepeatCustomer: true }
                });
            }
        }

        let existingOrder = await prisma.order.findFirst({
            where: {
                tenantId,
                OR: [
                    { externalOrderId: etsyOrderId },
                    { orderNumber: `ETSY-${etsyOrderId}` }
                ]
            },
            include: { items: true }
        });

        if (!existingOrder) {
            // Check by ID if not found (just in case)
            existingOrder = await prisma.order.findUnique({
                where: {
                    tenantId_orderNumber: {
                        tenantId: tenantId,
                        orderNumber: `ETSY-${etsyOrderId}`
                    }
                },
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

        let totalPrice = this.parseGermanFloat(firstRow['Order Total'] || firstRow['Adjusted Order Total']);
        const shippingCost = this.parseGermanFloat(firstRow['Order Shipping'] || firstRow['Shipping']);

        if (totalPrice === 0 && rows.length > 0) {
            const itemsTotal = rows.reduce((sum, row) => sum + (this.parseGermanFloat(row['Price']) * parseInt(row['Quantity'] || '1')), 0);
            totalPrice = itemsTotal + shippingCost;
        }

        const internalOrderNumber = await NumberRangeService.generateNumber('ORDER', userId);

        const order = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: internalOrderNumber,
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
        return OrderStatus.OPEN;
    }

    private parseGermanFloat(value: string | undefined): number {
        if (!value) return 0;
        let cleaned = value.replace(/[€$\s]/g, '');
        cleaned = cleaned.replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    private async detectSeparator(filePath: string): Promise<string> {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(filePath, { start: 0, end: 1000 });
            let data = '';
            stream.on('data', (chunk) => data += chunk.toString());
            stream.on('end', () => {
                if (data.includes(';') && !data.includes(',')) resolve(';');
                else resolve(',');
            });
        });
    }

    /**
     * Push local pending updates (Tracking) to Etsy
     */
    async pushUpdatesToEtsy(tenantId: string, userId: string): Promise<void> {
        console.log(`[Etsy Import] Checking for pending updates to push to Etsy...`);
        try {
            const pendingOrders = await prisma.order.findMany({
                where: {
                    tenantId,
                    platform: 'ETSY',
                    isSyncedToEtsy: false,
                    trackingNumber: { not: null },
                    externalOrderId: { not: null }
                }
            });

            if (pendingOrders.length === 0) {
                console.log(`[Etsy Import] No pending updates found.`);
                return;
            }

            console.log(`[Etsy Import] Found ${pendingOrders.length} orders to sync to Etsy.`);

            // Update Status for UI
            ImportStatusService.start(tenantId, pendingOrders.length, 'Sende Tracking-Daten an Etsy...');

            let processed = 0;
            let errors = 0;

            for (const order of pendingOrders) {
                try {
                    console.log(`[Etsy Push] Syncing Order ${order.externalOrderId} (Tracking: ${order.trackingNumber})...`);
                    await etsyTrackingService.syncTrackingToEtsy(
                        tenantId,
                        userId,
                        order.externalOrderId!,
                        order.trackingNumber!,
                        order.shippingProvider || 'DHL'
                    );

                    // Mark as synced
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { isSyncedToEtsy: true }
                    });
                    processed++;
                    ImportStatusService.increment(tenantId, `Gesendet: ${order.trackingNumber}`);
                } catch (err: any) {
                    console.error(`[Etsy Push] Failed to sync Order ${order.externalOrderId}:`, err);
                    errors++;
                    ImportStatusService.increment(tenantId, `Fehler bei Order ${order.externalOrderId}`);
                }
            }

            ImportStatusService.complete(tenantId, `Sync abgeschlossen: ${processed} Tracking-Nummern übertragen.`);

            if (processed > 0) {
                await ActivityLogService.log(
                    LogType.SUCCESS,
                    LogAction.ETSY_SYNC,
                    `Export to Etsy: ${processed} orders updated with tracking info.`,
                    userId,
                    tenantId
                );
            }

        } catch (error) {
            console.error('[Etsy Push] Global Error:', error);
        }
    }
}
