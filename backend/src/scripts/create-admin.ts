
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    try {
        console.log('--- Create or Update Admin User ---');

        const email = await question('Email: ');
        const password = await question('Password: ');

        if (!email || !password) {
            console.error('Email and password are required.');
            process.exit(1);
        }

        // Use bcryptjs hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            console.log(`User ${email} found! Updating password and ensuring ADMIN role...`);
            await prisma.user.update({
                where: { email },
                data: {
                    passwordHash: hashedPassword,
                    role: Role.ADMIN
                }
            });
            console.log('✅ User updated successfully.');
            console.log(`Role: ADMIN`);
            console.log(`Tenant ID: ${existingUser.tenantId}`);
        } else {
            const firstName = await question('First Name: ');
            const lastName = await question('Last Name: ');

            // Generate a Tenant ID
            const tenantId = crypto.randomUUID();

            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    firstName,
                    lastName,
                    role: Role.ADMIN,
                    tenantId,
                    settings: {
                        create: {
                            orderNumberFormat: 'BO-{YYYY}-{####}',
                            orderNumberStart: 1,
                            orderNumberCurrent: 1,
                            invoiceNumberFormat: 'RE-{YYYY}-{####}',
                            deliveryNoteFormat: 'LS-{YYYY}-{####}',
                            customerNumberFormat: 'KD-{YYYY}-{####}',
                            supplierOrderFormat: 'LB-{YYYY}-{####}',
                            setupCompleted: true
                        }
                    }
                }
            });
            console.log(`\n✅ Admin user created successfully!`);
            console.log(`Tenant ID: ${tenantId}`);
        }

        console.log('\nYou can now log in at the frontend.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
