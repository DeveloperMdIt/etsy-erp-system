
import { ProductCatalogImportService } from '../src/services/product-import.service';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const service = new ProductCatalogImportService();

async function runRepro() {
    const tenantId = 'repro-broken-tenant';
    const originalCsvPath = path.resolve(__dirname, 'fixtures/broken_variations_repro.csv');
    const csvPath = path.resolve(__dirname, 'fixtures/temp_broken_repro.csv');

    // Copy file to temp location because service deletes it
    fs.copyFileSync(originalCsvPath, csvPath);

    console.log('Running reproduction import from:', csvPath);

    try {
        // Clean up previous run
        await prisma.productVariation.deleteMany({
            where: { product: { tenantId } }
        });
        await prisma.product.deleteMany({
            where: { tenantId }
        });

        // Run Import
        const result = await service.importProductsFromCsv(csvPath, tenantId);
        console.log('Import result:', result);

        // Verify Data
        const product = await prisma.product.findFirst({
            where: { tenantId, name: 'Test Variation Product' },
            include: { variations: true }
        });

        if (!product) {
            console.error('FAILED: Product not found');
            process.exit(1);
        }

        console.log('Product created:', product.sku, product.name);
        console.log('Variations found:', product.variations.length);

        // Check variations
        const sortedVars = product.variations.sort((a, b) => a.sku.localeCompare(b.sku));
        sortedVars.forEach(v => {
            console.log(`Variation: SKU=${v.sku} Name1=${v.name1} Value1=${v.value1}`);
        });

        if (product.variations.length !== 5) {
            console.error(`ERROR: Expected 5 variations, got ${product.variations.length}`);
            process.exit(1);
        }

        const rose = sortedVars.find(v => v.sku === '10005');
        if (rose?.value1 === 'Rosa') {
            console.log('SUCCESS: Broken CSV correctly parsed and shifted!');
        } else {
            console.error(`FAILED: Expected 'Rosa', got '${rose?.value1}'`);
            process.exit(1);
        }

    } catch (error) {
        console.error('Error in repro:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runRepro();
