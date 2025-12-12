
import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import ImportStatusService from './import-status.service';

const prisma = new PrismaClient();

interface EtsyProductCSV {
    'TITEL': string;
    'BESCHREIBUNG': string;
    'PREIS': string;
    'WÄHRUNGSCODE': string;
    'STÜCKZAHL': string;
    'TAGS': string;
    'MATERIALIEN': string;
    'BILD1': string;
    'BILD2': string;
    'BILD3': string;
    'BILD4': string;
    'BILD5': string;
    'BILD6': string;
    'BILD7': string;
    'BILD8': string;
    'BILD9': string;
    'BILD10': string;
    'VARIATIONSTYP 1': string;
    'VARIATIONSNAME 1': string;
    'VARIATIONSWERT 1': string;
    'VARIATIONSTYP 2': string;
    'VARIATIONSNAME 2': string;
    'VARIATIONSWERT 2': string;
    'BESTANDSEINHEIT': string;
    [key: string]: string; // Allow index signature for dynamic access like _15
}

export interface ProductImportResult {
    success: boolean;
    productsCreated: number;
    productsUpdated: number;
    errors: string[];
    fileName: string;
}

export class ProductCatalogImportService {

    private normalizeRow(row: any): any {
        const normalized = { ...row };
        const mappings: Record<string, string> = {
            'WÃ„HRUNGSCODE': 'WÄHRUNGSCODE',
            'STÃœCKZAHL': 'STÜCKZAHL',
            'Ãœ': 'Ü',
            'Ã„': 'Ä',
            'ï»¿TITEL': 'TITEL' // BOM artifact
        };

        for (const key of Object.keys(row)) {
            if (mappings[key]) {
                normalized[mappings[key]] = row[key];
            }
        }
        return normalized;
    }

    private getSkuFromRow(row: EtsyProductCSV): string | undefined {
        const safeRow = this.normalizeRow(row);

        // 1. Try BESTANDSEINHEIT
        let skuRaw = safeRow['BESTANDSEINHEIT'];

        // 2. Check for overflow columns (shifted data)
        const keys = Object.keys(safeRow);
        const overflowKeys = keys.filter(k => /^_\d+$/.test(k));

        if (overflowKeys.length > 0) {
            // Find the highest index (last column)
            const lastKey = overflowKeys.sort((a, b) => {
                const idxA = parseInt(a.substring(1));
                const idxB = parseInt(b.substring(1));
                return idxB - idxA;
            })[0];

            if (safeRow[lastKey]) {
                skuRaw = safeRow[lastKey];
            }
        }

        return skuRaw;
    }

    /**
     * Parse and import Etsy product catalog from CSV
     */
    async importProductsFromCsv(filePath: string, tenantId: string): Promise<ProductImportResult> {
        const results: EtsyProductCSV[] = [];
        const errors: string[] = [];
        let productsCreated = 0;
        let productsUpdated = 0;

        // Phase 1: Scan for Max SKU in CSV
        console.log('Starting Phase 1: Scanning CSV for existing SKUs...');
        ImportStatusService.start(tenantId, 0, 'Scanning CSV for SKUs...');

        const csvMaxSku = await this.scanForMaxSku(filePath);
        console.log(`Phase 1 Complete. Found Max SKU in CSV: ${csvMaxSku}`);

        // Check for valid user
        let user = await prisma.user.findFirst({ where: { tenantId } });
        if (!user) {
            console.warn(`No user found for tenantId ${tenantId}. Trying fallback to first available user.`);
            user = await prisma.user.findFirst();
        }

        if (!user) {
            throw new Error(`No user found in database. Cannot import products. Please create a user first.`);
        }

        const userId = user.id;

        // Phase 2: Create SKU generator
        // Get DB Max
        const products = await prisma.product.findMany({ where: { tenantId }, select: { sku: true } });
        const variations = await prisma.product_variations.findMany({
            where: { product: { tenantId } },
            select: { sku: true }
        });

        let dbMaxSku = 10000;
        [...products, ...variations].forEach(p => {
            const val = parseInt(p.sku);
            if (!isNaN(val) && val > dbMaxSku) dbMaxSku = val;
        });

        console.log(`DB Max SKU: ${dbMaxSku}`);

        // Start Generator from global max
        let currentSkuCounter = Math.max(csvMaxSku, dbMaxSku);
        console.log(`Starting SKU Generator at: ${currentSkuCounter}`);

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('error', (error) => {
                    ImportStatusService.error(tenantId, error.message);
                    reject(error);
                })
                .on('end', async () => {
                    try {
                        ImportStatusService.start(tenantId, results.length, 'Importing products...');
                        let currentProgress = 0;

                        for (const row of results) {
                            try {
                                ImportStatusService.increment(tenantId, `Importing ${row['TITEL']?.substring(0, 30)}...`);
                                // DEBUG LOG
                                console.log(`Processing Row: ${row['TITEL']} | SKU: ${row['BESTANDSEINHEIT']}`);

                                const result = await this.processProduct(tenantId, userId, row, () => {
                                    currentSkuCounter++;
                                    return currentSkuCounter.toString();
                                });

                                console.log(` -> Result: ${result}`);

                                if (result === 'created') {
                                    productsCreated++;
                                } else if (result === 'updated') {
                                    productsUpdated++;
                                }
                            } catch (err: any) {
                                console.error(`Error processing product ${row['TITEL']}:`, err);
                                errors.push(`Product ${row['TITEL']}: ${err.message}`);
                            }
                            currentProgress++;
                        }

                        ImportStatusService.complete(tenantId, `Imported ${productsCreated} new, updated ${productsUpdated} products.`);

                        resolve({
                            success: true,
                            productsCreated,
                            productsUpdated,
                            errors,
                            fileName: filePath
                        });

                    } catch (error: any) {
                        reject(error);
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
                });
        });
    }

    /**
     * Phase 1: Scan CSV for the highest SKU to avoid collisions during sequential processing
     */
    private async scanForMaxSku(filePath: string): Promise<number> {
        let maxSku = 0;
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row: any) => {
                    // Check BESTANDSEINHEIT (can be comma separated)
                    const skuRaw = this.getSkuFromRow(row);

                    if (skuRaw) {
                        const skus = skuRaw.split(',').map((s: string) => s.trim());
                        for (const sku of skus) {
                            const val = parseInt(sku);
                            if (!isNaN(val) && val > maxSku) {
                                maxSku = val;
                            }
                        }
                    }
                })
                .on('error', reject)
                .on('end', () => resolve(maxSku));
        });
    }

    private async processProduct(tenantId: string, userId: string, rawRow: EtsyProductCSV, nextSkuFn: () => string): Promise<'created' | 'updated'> {
        const row = this.normalizeRow(rawRow);

        const name = row['TITEL'];
        const description = row['BESCHREIBUNG'];
        let priceRaw = row['PREIS'];
        let currencyRaw = row['WÄHRUNGSCODE'];
        let quantityRaw = row['STÜCKZAHL'];
        let tagsRaw = row['TAGS'];
        let materialsRaw = row['MATERIALIEN'];
        let imageRaw = row['BILD1'];
        let varVal1Raw = row['VARIATIONSWERT 1'];
        let varVal2Raw = row['VARIATIONSWERT 2'];
        let skuRaw = row['BESTANDSEINHEIT'];

        // Heuristic for Column Shift (e.g. 12,99 split into PREIS=12, WÄR=99)
        // Check if WÄHRUNGSCODE looks numeric (part of price) and STÜCKZAHL looks like currency (EUR/USD)
        if (currencyRaw && /^\d+$/.test(currencyRaw.trim()) && quantityRaw && /^[A-Z]{3}$/.test(quantityRaw.trim())) {
            // console.log('Detected column shift due to unquoted price. Remapping fields.');

            // Shifted by 1
            priceRaw = `${priceRaw},${currencyRaw}`; // Reconstruct price
            // currencyRaw = quantityRaw; 
            quantityRaw = row['TAGS'];
            tagsRaw = row['MATERIALIEN'];
            materialsRaw = row['BILD1'];
            imageRaw = row['VARIATIONSTYP 1'];

            // Variations are shifted
            varVal1Raw = row['VARIATIONSTYP 2'];
            varVal2Raw = row['BESTANDSEINHEIT'];

            // Real SKU is in the overflow column
            const correctSku = this.getSkuFromRow(row);
            if (correctSku) {
                skuRaw = correctSku;
            }
        }

        const price = this.parseGermanFloat(priceRaw);

        // Parse comma-separated fields
        const skus = (skuRaw?.trim() || '').split(',').map((s: string) => s.trim()).filter((s: string) => s);

        const stockRaw = quantityRaw?.trim() || '0';
        const stocks = stockRaw.split(',').map((s: string) => parseInt(s.trim()) || 0);

        const imageUrl = imageRaw?.trim() || '';
        const tags = tagsRaw?.trim() || '';
        const materials = materialsRaw?.trim() || '';

        const varType1 = row['VARIATIONSTYP 1']?.trim() || '';
        const varName1 = row['VARIATIONSNAME 1']?.trim() || '';
        const varValues1 = (varVal1Raw?.trim() || '').split(',').map((s: string) => s.trim());

        const varType2 = row['VARIATIONSTYP 2']?.trim() || '';
        const varName2 = row['VARIATIONSNAME 2']?.trim() || '';
        const varValues2 = (varVal2Raw?.trim() || '').split(',').map((s: string) => s.trim());

        // Determine existing product first
        let product = await prisma.product.findFirst({
            where: { tenantId, name: name }
        });

        // If not found by name, and it looks like a single-item product, check SKU
        if (!product && skus.length === 1 && skus[0]) {
            product = await prisma.product.findFirst({
                where: { tenantId, sku: skus[0] }
            });
        }

        let mainSku: string;

        if (skus.length > 1) {
            // Multi-variation product: Parent needs distinct SKU
            if (product && !skus.includes(product.sku)) {
                // Existing parent has a distinct SKU (safe)
                mainSku = product.sku;
            } else {
                // New product OR Legacy product sharing SKU with child -> Generate new Parent SKU
                mainSku = nextSkuFn();
            }
        } else {
            // Single SKU
            if (product) {
                mainSku = product.sku;
            } else {
                // Use the counter function or existing SKU if present
                mainSku = skus[0] || nextSkuFn();
            }
        }


        const productData = {
            name,
            description,
            price, // Base price
            imageUrl: imageUrl || undefined,
            stockQuantity: stocks.reduce((a: number, b: number) => a + b, 0), // Sum of stocks
            tags,
            materials,
            variationType1: varType1,
            variationName1: varName1,
            variationType2: varType2,
            variationName2: varName2,
            variationValue1: row['VARIATIONSWERT 1'],
            variationValue2: row['VARIATIONSWERT 2'],
        };

        if (product) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    ...productData,
                    sku: mainSku
                }
            });
        } else {
            product = await prisma.product.create({
                data: {
                    userId: userId,
                    tenantId,
                    sku: mainSku,
                    ...productData,
                    imageUrl: imageUrl || '',
                    weight: 0
                }
            });
        }

        // Handle Variations
        if (skus.length > 0) {
            for (let i = 0; i < skus.length; i++) {
                const variantSku = skus[i];
                const val1 = varValues1[i] || varValues1[0] || '';
                const val2 = varValues2[i] || varValues2[0] || '';
                const variantStock = stocks[i] !== undefined ? stocks[i] : (stocks[0] || 0);

                // Check if variation exists
                const existingVar = await prisma.product_variations.findUnique({
                    where: {
                        productId_sku: {
                            productId: product.id,
                            sku: variantSku
                        }
                    }
                });

                if (existingVar) {
                    await prisma.product_variations.update({
                        where: { id: existingVar.id },
                        data: {
                            price: price,
                            stockQuantity: variantStock,
                            name1: varName1,
                            value1: val1,
                            name2: varName2,
                            value2: val2
                        }
                    });
                } else {
                    await prisma.product_variations.create({
                        data: {
                            id: `${product.id}-${variantSku}`,
                            productId: product.id,
                            sku: variantSku,
                            price: price,
                            stockQuantity: variantStock,
                            name1: varName1,
                            value1: val1,
                            name2: varName2,
                            value2: val2,
                            updatedAt: new Date()
                        }
                    });
                }
            }
        }

        return product ? 'updated' : 'created';
    }

    /**
     * Generate next SKU in sequence (Legacy - mostly unused by import now, but kept for logical completeness or partial calls)
     */
    private async generateNextSKU(tenantId: string): Promise<string> {
        const products = await prisma.product.findMany({
            where: { tenantId },
            select: { sku: true }
        });

        // Also check variations for used SKUs
        const variations = await prisma.product_variations.findMany({
            where: { product: { tenantId } },
            select: { sku: true }
        });

        let maxSku = 10000;

        const allSkus = [...products.map(p => p.sku), ...variations.map(v => v.sku)];

        for (const sku of allSkus) {
            const numericSku = parseInt(sku);
            if (!isNaN(numericSku) && numericSku > maxSku) {
                maxSku = numericSku;
            }
        }

        return (maxSku + 1).toString();
    }

    /**
     * Parse float that might be in German format (1.234,56) or US format (1,234.56)
     */
    private parseGermanFloat(value: string | undefined): number {
        if (!value) return 0;
        let cleaned = value.replace(/[€$£\s]/g, '');

        if (cleaned.includes(',') && !cleaned.includes('.')) {
            cleaned = cleaned.replace(',', '.');
        } else if (cleaned.includes('.') && cleaned.includes(',')) {
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            if (lastComma > lastDot) {
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else {
                cleaned = cleaned.replace(/,/g, '');
            }
        }

        return parseFloat(cleaned) || 0;
    }
}
