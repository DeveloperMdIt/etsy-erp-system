import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'admin@retrovision.com'; // Default email
        const tenantId = 'default-tenant';

        let user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            // Check if ANY user exists to avoid duplicates if email differs
            const anyUser = await prisma.user.findFirst();
            if (anyUser) {
                console.log('A user already exists:', anyUser.id);
                user = anyUser;
            } else {
                console.log('Creating default user...');
                user = await prisma.user.create({
                    data: {
                        email,
                        passwordHash: '$2b$10$EpIq/s1s..dummyhash...', // Placeholder
                        firstName: 'Admin',
                        lastName: 'User',
                        tenantId,
                    }
                });
                console.log('User created:', user.id);
            }
        } else {
            console.log('User already exists:', user.id);
        }

        // Ensure UserSettings
        const settings = await prisma.userSettings.findUnique({
            where: { userId: user.id }
        });

        if (!settings) {
            console.log('Creating user settings...');
            await prisma.userSettings.create({
                data: {
                    userId: user.id,
                    orderNumberFormat: 'BO-{YYYY}-{####}',
                    orderNumberStart: 1,
                    orderNumberCurrent: 1,
                    customerNumberFormat: 'KD-{YYYY}-{####}',
                    customerNumberStart: 1,
                    customerNumberCurrent: 1,
                    invoiceNumberFormat: 'RE-{YYYY}-{####}',
                    invoiceNumberStart: 1,
                    invoiceNumberCurrent: 1,
                    deliveryNoteFormat: 'LS-{YYYY}-{####}',
                    deliveryNoteStart: 1,
                    deliveryNoteCurrent: 1,
                    supplierOrderFormat: 'LB-{YYYY}-{####}',
                    supplierOrderStart: 1,
                    supplierOrderCurrent: 1,
                }
            });
            console.log('User settings created.');
        } else {
            console.log('User settings already exist.');
        }

    } catch (error) {
        console.error('Error seeding user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
