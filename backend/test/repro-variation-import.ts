
import { ProductCatalogImportService } from '../src/services/product-import.service';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const service = new ProductCatalogImportService();

async function runRepro() {
    const tenantId = 'repro-variation-tenant';
    const csvPath = path.resolve(__dirname, 'fixtures/temp_repro.csv');

    // Create a custom CSV with BROKEN headers (Mojibake) AND Shifted Columns to test the fix
    // Header does NOT have the SKU column for the shifted value, so it overflows
    const csvContent = `TITEL,BESCHREIBUNG,PREIS,WÃ„HRUNGSCODE,STÃœCKZAHL,TAGS,MATERIALIEN,BILD1,BILD2,BILD3,BILD4,BILD5,BILD6,BILD7,BILD8,BILD9,BILD10,VARIATIONSTYP 1,VARIATIONSNAME 1,VARIATIONSWERT 1,VARIATIONSTYP 2,VARIATIONSNAME 2,VARIATIONSWERT 2,BESTANDSEINHEIT
Test Variation Product,Desc,12,99,EUR,999,Tags,Mat,img1,,,,,,,,,,Hauptfarbe,Rosa,10010,10010_1,10005,10005
Test Variation Product,Desc,12,99,EUR,999,Tags,Mat,img1,,,,,,,,,,Hauptfarbe,Smaragd,10010,10010_2,10006,10006
Test Variation Product,Desc,12,99,EUR,999,Tags,Mat,img1,,,,,,,,,,Hauptfarbe,Braun,10010,10010_3,10007,10007
Test Variation Product,Desc,12,99,EUR,999,Tags,Mat,img1,,,,,,,,,,Hauptfarbe,Hellgrau,10010,10010_4,10008,10008
Test Variation Product,Desc,12,99,EUR,999,Tags,Mat,img1,,,,,,,,,,Hauptfarbe,Dunkelgrau,10010,10010_5,10009,10009
`;

    fs.writeFileSync(csvPath, csvContent);

    console.log('Running reproduction import from:', csvPath);

    // Ensure a user exists for the tenant
    let user = await prisma.user.findFirst({ where: { tenantId } });
    if (!user) {
        console.log('Creating test user for tenant:', tenantId);
        user = await prisma.user.create({
            data: {
                tenantId,
                email: 'test-repro@example.com',
                passwordHash: 'dummy'
            }
        });
    }

    try {
        // Clean up previous run
        await prisma.product_variations.deleteMany({
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

        if (product.variations.length !== 5) {
            console.error(`ERROR: Expected 5 variations, got ${product.variations.length}`);
            process.exit(1);
        }

        console.log('SUCCESS: Variations mapped correctly');

    } catch (error) {
        console.error('Error in repro:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runRepro();
