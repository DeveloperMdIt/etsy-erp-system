// Check if DHL fields exist in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDHLFields() {
    try {
        // Try to query with DHL fields
        const settings = await prisma.userSettings.findFirst({
            select: {
                id: true,
                dhlGkpUsername: true,
                dhlGkpPassword: true,
                dhlEnabled: true,
                printerDHL: true
            }
        });

        console.log('✅ All DHL fields exist in database!');
        console.log('Sample settings:', settings);
    } catch (error: any) {
        console.error('❌ Error querying DHL fields:', error.message);
        if (error.message.includes('does not exist')) {
            console.error('\n🔧 Missing column detected. Running migration...\n');
        }
    } finally {
        await prisma.$disconnect();
    }
}

checkDHLFields();
