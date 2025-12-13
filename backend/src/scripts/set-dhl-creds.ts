
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'b0caed80-870a-455e-940f-482f61c86db9'; // From logs

    console.log(`Updating settings for user ${userId}...`);

    try {
        const settings = await prisma.userSettings.upsert({
            where: { userId: userId },
            update: {
                dhlEnabled: true,
                dhlGkpUsername: 'inventivy-packtisch',
                dhlGkpPassword: 'Euramobil161090!',
                dhlEkp: '6339014020',
                dhlProcedure: '01', // Standard
                dhlParticipation: '01' // Standard
            },
            create: {
                userId: userId,
                dhlEnabled: true,
                dhlGkpUsername: 'inventivy-packtisch',
                dhlGkpPassword: 'Euramobil161090!',
                dhlEkp: '6339014020',
                dhlProcedure: '01',
                dhlParticipation: '01'
            }
        });
        console.log('Successfully updated DHL settings:', settings);
    } catch (e) {
        console.error('Error updating settings:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
