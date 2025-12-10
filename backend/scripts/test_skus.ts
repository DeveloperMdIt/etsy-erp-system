import { ProductCatalogImportService } from '../src/services/product-import.service';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const service = new ProductCatalogImportService();

async function runTest() {
    const tenantId = 'test-tenant-' + Date.now();
    const csvPath = path.join(__dirname, 'test_variations.csv');

    console.log('Creating test CSV...');
    // Create CSV with a multi-variation product
    // SKUs: CHILD1, CHILD2
    // Expected: Parent gets numeric SKU, Children keep CHILD1, CHILD2
    const csvContent = `TITEL,BESCHREIBUNG,PREIS,WÄHRUNGSCODE,STÜCKZAHL,TAGS,MATERIALIEN,BILD1,BILD2,BILD3,BILD4,BILD5,BILD6,BILD7,BILD8,BILD9,BILD10,VARIATIONSTYP 1,VARIATIONSNAME 1,VARIATIONSWERT 1,VARIATIONSTYP 2,VARIATIONSNAME 2,VARIATIONSWERT 2,BESTANDSEINHEIT
TestParent,Desc,10.00,EUR,5,Tag1,Mat1,,,,,,,,,,,Color,Color,"Red, Blue",Size,Size,"S, M","CHILD1, CHILD2"`;

    fs.writeFileSync(csvPath, csvContent);

    try {
        console.log('Running import...');
        const result = await service.importProductsFromCsv(csvPath, tenantId);
        console.log('Import result:', result);

        console.log('Verifying DB...');
        const product = await prisma.product.findFirst({
            where: { tenantId, name: 'TestParent' },
            include: { variations: true }
        });

        if (!product) {
            console.error('FAILED: Product not found');
            return;
        }

        console.log(`Parent SKU: ${product.sku}`);
        console.log(`Variations count: ${product.variations.length}`);

        product.variations.forEach(v => {
            console.log(`- Variation SKU: ${v.sku}`);
        });

        if (product.sku === 'CHILD1' || product.sku === 'CHILD2') {
            console.error('FAILED: Parent SKU should NOT be one of the child SKUs');
        } else {
            console.log('SUCCESS: Parent SKU is distinct from child SKUs');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
        await prisma.product.deleteMany({ where: { tenantId } });
        await prisma.$disconnect();
    }
}

runTest();
