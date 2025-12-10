
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'waltraud-maria-deja@gmx.de';
    const password = 'password';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log(`User found: ${user.email}`);
        console.log(`Stored Hash: ${user.passwordHash}`);

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log(`Comparison result for '${password}': ${isValid}`);

        // Try hashing 'password' again to see if it matches format
        const newHash = await bcrypt.hash(password, 10);
        console.log(`New Hash for test: ${newHash}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
