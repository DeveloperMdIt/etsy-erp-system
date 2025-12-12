
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up invalid users...');

    // Check count before
    const countBefore = await prisma.user.count();
    console.log('Users before:', countBefore);

    // Delete users with empty or null email
    // Using raw query to ensure we hit them even if Prisma Client filters them
    const result = await prisma.$executeRawUnsafe(`
        DELETE FROM users 
        WHERE email IS NULL 
           OR email = '' 
           OR trim(email) = ''
    `);

    console.log('Deleted rows:', result);

    const countAfter = await prisma.user.count();
    console.log('Users after:', countAfter);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
