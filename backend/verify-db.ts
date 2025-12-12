
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Verification ---');
    console.log('CWD:', process.cwd());
    const dbPath = path.resolve('prisma/dev.db');
    console.log('Expected DB Path:', dbPath);

    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log('DB File Size:', stats.size, 'bytes');
    } else {
        console.error('DB File NOT FOUND at expected path!');
    }

    const count = await prisma.user.count();
    console.log('Prisma User Count:', count);

    // Check if any users have empty email
    const emptyEmail = await prisma.user.count({ where: { email: '' } });
    console.log('Users with empty email:', emptyEmail);

    const nullEmail = await prisma.$queryRawUnsafe('SELECT COUNT(*) as c FROM users WHERE email IS NULL');
    console.log('Users with NULL email (Raw):', nullEmail);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
