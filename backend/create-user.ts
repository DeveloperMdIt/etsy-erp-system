
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'waltraud-maria-deja@gmx.de';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash: hashedPassword,
                firstName: 'Waltraud',
                lastName: 'Deja',
                shopName: 'Gluecksmomente1'
                // Schema in Step 113 says 'shopName' on line 20.
                // But let's check exact schema again if needed.
                // Line 20: shopName String?
            },
            create: {
                email,
                passwordHash: hashedPassword,
                firstName: 'Waltraud',
                lastName: 'Deja',
                shopName: 'Gluecksmomente1',
                role: 'USER'
            },
        });

        // Also ensure UserSettings exist
        await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                orderNumberFormat: 'BO-{YYYY}-{####}',
                invoiceNumberFormat: 'RE-{YYYY}-{####}',
                etsyShopName: 'Gluecksmomente1'
                // Wait, UserSettings has 'etsyShopName', user has 'shopName'.
            }
        });

        console.log(`User ${email} created/updated with password: ${password}`);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
