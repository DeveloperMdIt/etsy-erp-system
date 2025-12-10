
import { ProductCatalogImportService } from '../src/services/product-import.service';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();
const service = new ProductCatalogImportService();

async function runTest() {
    const tenantId = 'collision-test-tenant';

    console.log('Running SKU collision test...');

    try {
        await prisma.productVariation.deleteMany({ where: { product: { tenantId } } });
        await prisma.product.deleteMany({ where: { tenantId } });

        // 1. Create Product A with SKU 10001
        // And manually add a variation with SKU 10002
        const productA = await prisma.product.create({
            data: {
                tenantId,
                sku: '10001',
                name: 'Product A',
                description: 'Desc',
                price: 10,
                weight: 0
            }
        });

        await prisma.productVariation.create({
            data: {
                productId: productA.id,
                sku: '10002', // This blocks the next sequential number
                price: 10,
                stockQuantity: 5,
                name1: 'Color',
                value1: 'Red',
                name2: '',
                value2: ''
            }
        });

        console.log('Created Product A (10001) with Variation (10002)');

        // 2. Import a new product via CSV (should generate SKU)
        // We expect it to be 10003, NOT 10002
        const csvContent = `TITEL,BESCHREIBUNG,PREIS,WÄHRUNGSCODE,STÜCKZAHL,TAGS,MATERIALIEN,BILD1,VARIATIONSTYP 1,VARIATIONSNAME 1,VARIATIONSWERT 1,VARIATIONSTYP 2,VARIATIONSNAME 2,VARIATIONSWERT 2,BESTANDSEINHEIT
Product B,Desc,10,EUR,1,tag,,http://img,,,,,,`;

        const fs = require('fs');
        const csvPath = path.resolve(__dirname, 'fixtures/collision_test.csv');
        fs.writeFileSync(csvPath, csvContent);

        await service.importProductsFromCsv(csvPath, tenantId);

        const productB = await prisma.product.findFirst({
            where: { tenantId, name: 'Product B' }
        });

        if (!productB) {
            console.error('FAILED: Product B not found');
            process.exit(1);
        }

        console.log(`Product B created with SKU: ${productB.sku}`);

        if (productB.sku === '10002') {
            console.error('FAILED: Collision detected! SKU is 10002');
            process.exit(1);
        } else if (parseInt(productB.sku) > 10002) {
            console.log('SUCCESS: SKU > 10002 generated');
        } else {
            console.warn(`WARNING: Unexpected SKU ${productB.sku}`);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
