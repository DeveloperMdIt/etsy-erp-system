
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing user modules...');

    // 1. Ensure Modules Exist (Quick seed check)
    const modules = await prisma.module.findMany();
    if (modules.length === 0) {
        console.error('No modules found! Please run "npx ts-node prisma/seed_modules.ts" first.');
        return;
    }

    // 2. Get All Users
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.error('No users found in database.');
        return;
    }

    console.log(`Found ${users.length} users. Fixing modules for all...`);

    // 3. Assign All Active Modules to All Users
    const activeModules = modules.filter(m => m.isActive);

    for (const user of users) {
        console.log(`Processing user: ${user.email}`);
        for (const mod of activeModules) {
            const existing = await prisma.userModule.findFirst({
                where: {
                    userId: user.id,
                    moduleId: mod.id
                }
            });

            if (!existing) {
                await prisma.userModule.create({
                    data: {
                        userId: user.id,
                        moduleId: mod.id,
                        isActive: true
                    }
                });
                console.log(`  + Added module "${mod.name}"`);
            } else {
                // optional: ensure it is active
                if (!existing.isActive) {
                    await prisma.userModule.update({
                        where: { id: existing.id },
                        data: { isActive: true }
                    });
                    console.log(`  ~ Reactivated module "${mod.name}"`);
                } else {
                    console.log(`  = User already has module "${mod.name}"`);
                }
            }
        }
    }

    console.log('All users fixed! Please log out and log in again.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
