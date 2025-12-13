
import { PrismaClient } from '@prisma/client';
import numberRangeService from '../services/number-range.service';

const prisma = new PrismaClient();
const userId = 'b0caed80-870a-455e-940f-482f61c86db9';

async function main() {
    console.log('Testing User Fetch...');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            shopName: true,
            firstName: true,
            lastName: true,
            email: true,
            labelProfiles: true
        }
    });
    console.log('User:', user);

    console.log('Testing Settings Fetch...');
    let settings = await prisma.userSettings.findUnique({
        where: { userId },
    });
    console.log('Settings Found:', !!settings);

    if (!settings) {
        console.log('Creating settings...');
        settings = await prisma.userSettings.create({
            data: { userId }
        });
    }

    console.log('Testing Number Previews...');
    try {
        // Test one by one to find the culprit
        console.log('ORDER preview...');
        await numberRangeService.previewNumber('ORDER', userId);

        console.log('INVOICE preview...');
        await numberRangeService.previewNumber('INVOICE', userId);

        console.log('DELIVERY preview...');
        await numberRangeService.previewNumber('DELIVERY', userId);

        console.log('SUPPLIER preview...');
        await numberRangeService.previewNumber('SUPPLIER', userId);

        console.log('CUSTOMER preview...');
        await numberRangeService.previewNumber('CUSTOMER', userId);

        console.log('All previews success.');
    } catch (e) {
        console.error('Number Preview Error:', e);
        throw e;
    }
}

main()
    .catch((e) => {
        console.error('Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
