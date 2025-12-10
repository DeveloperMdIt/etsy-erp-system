
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Keys on prisma instance:', Object.keys(prisma));

    // Check for variation related keys specifically
    const variationKeys = Object.keys(prisma).filter(k => k.toLowerCase().includes('variation'));
    console.log('Variation related keys:', variationKeys);

    // Try to access the models to see if they are undefined
    console.log('prisma.productVariation:', (prisma as any).productVariation ? 'Defined' : 'Undefined');
    console.log('prisma.productVariations:', (prisma as any).productVariations ? 'Defined' : 'Undefined');
    console.log('prisma.product_variations:', (prisma as any).product_variations ? 'Defined' : 'Undefined');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
