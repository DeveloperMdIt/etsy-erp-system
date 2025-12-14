
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
        console.log('--- Create Admin User ---');

        const email = await question('Email: ');
        const password = await question('Password: ');
        const firstName = await question('First Name: ');
        const lastName = await question('Last Name: ');

        if (!email || !password) {
            console.error('Email and password are required.');
            process.exit(1);
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.error('User with this email already exists.');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const tenantId = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                role: Role.ADMIN, // Explicitly set ADMIN role
                tenantId,
                settings: {
                    create: {
                        // Default settings
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
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Tenant ID: ${user.tenantId}`);
        console.log('\nYou can now log in at the frontend.');

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
