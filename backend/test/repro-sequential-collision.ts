
import { ProductCatalogImportService } from '../src/services/product-import.service';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const service = new ProductCatalogImportService();

async function runTest() {
    const tenantId = 'seq-collision-test-tenant';

    console.log('Running Sequential SKU collision test...');

    try {
        await prisma.productVariation.deleteMany({ where: { product: { tenantId } } });
        await prisma.product.deleteMany({ where: { tenantId } });
        // CSV Content:
        // Row 1: "Product A" (No SKU) -> Should generated SKU > 10005
        // Row 2: "Product B" (SKU 10005) -> Reserved!

        const csvContent =
            `TITEL,BESCHREIBUNG,PREIS,WÄHRUNGSCODE,STÜCKZAHL,TAGS,MATERIALIEN,BILD1,VARIATIONSTYP 1,VARIATIONSNAME 1,VARIATIONSWERT 1,VARIATIONSTYP 2,VARIATIONSNAME 2,VARIATIONSWERT 2,BESTANDSEINHEIT
Product A,Desc,10,EUR,1,tag,http://img,,,,,,,,
Product B,Desc,10,EUR,1,tag,,http://img,,,,,,,10005`;

        const csvPath = path.resolve(__dirname, 'fixtures/seq_collision_test.csv');
        fs.writeFileSync(csvPath, csvContent);

        console.log('Created CSV with "future" reservation of 10005');

        await service.importProductsFromCsv(csvPath, tenantId);

        const productA = await prisma.product.findFirst({ where: { tenantId, name: 'Product A' } });
        const productB = await prisma.product.findFirst({ where: { tenantId, name: 'Product B' } });

        if (!productA || !productB) {
            console.error('FAILED: Products not created');
            process.exit(1);
        }

        console.log(`Product A SKU: ${productA.sku}`);
        console.log(`Product B SKU: ${productB.sku}`);

        if (productA.sku === '10005') {
            console.error('FAILED: Product A stole 10005 properly belonging to Product B');
            process.exit(1);
        }

        if (parseInt(productA.sku) > 10005) {
            console.log('SUCCESS: Product A correctly respected the reserved 10005 and generated a higher SKU');
        } else {
            console.warn(`WARNING: Product A got ${productA.sku}, expected > 10005`);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
