
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for users without settings...');
    const users = await prisma.user.findMany({
        include: { settings: true }
    });

    for (const user of users) {
        if (!user.settings) {
            console.log(`Fixing settings for user: ${user.email} (${user.id})`);
            await prisma.userSettings.create({
                data: {
                    userId: user.id,
                    orderNumberFormat: 'BO-{YYYY}-{####}',
                    invoiceNumberFormat: 'RE-{YYYY}-{####}',
                    deliveryNoteFormat: 'LS-{YYYY}-{####}',
                    customerNumberFormat: 'KD-{YYYY}-{####}',
                }
            });
        }
    }
    console.log('Repair complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
