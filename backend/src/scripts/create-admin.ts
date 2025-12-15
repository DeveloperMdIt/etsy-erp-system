
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@inventivy.de';
    const password = 'password123';

    console.log(`Creating/Updating admin user: ${email}`);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: 'ADMIN',
            isVerified: true,
            firstName: 'Admin',
            lastName: 'User'
        },
        create: {
            email,
            passwordHash,
            role: 'ADMIN',
            isVerified: true,
            firstName: 'Admin',
            lastName: 'User',
            shopName: 'Inventivy HQ'
        }
    });

    console.log('User created:', user.id);

    // Ensure UserSettings exist
    await prisma.userSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            orderNumberFormat: 'BE-{YYYY}-{####}',
            invoiceNumberFormat: 'RE-{YYYY}-{####}',
            deliveryNoteFormat: 'LS-{YYYY}-{####}',
            customerNumberFormat: 'KD-{YYYY}-{####}',
        }
    });

    console.log('Settings ensured.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
