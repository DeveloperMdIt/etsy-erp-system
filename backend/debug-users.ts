
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching users via raw query...');
    try {
        const users = await prisma.$queryRawUnsafe('SELECT * FROM users');
        console.log('Found users (raw):', Array.isArray(users) ? users.length : 0);

        if (Array.isArray(users)) {
            for (const u of users) {
                console.log(`ID: ${u.id}`);
                console.log(`Email: '${u.email}' (Type: ${typeof u.email})`);
                console.log(`CreatedAt: ${u.createdAt}`);
                console.log('-------------------');
            }
        } else {
            console.log('Result is not an array:', users);
        }
    } catch (e) {
        console.error('Raw query failed:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
