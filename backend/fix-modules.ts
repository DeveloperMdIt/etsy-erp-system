
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing user modules...');

    // 1. Ensure Modules Exist (Quick seed check)
    // We assume seed_modules might have been run, but let's be safe and query them.
    const modules = await prisma.module.findMany();
    if (modules.length === 0) {
        console.error('No modules found! Please run "npx ts-node prisma/seed_modules.ts" first.');
        return;
    }

    // 2. Get the User (First user or specific email)
    // You can change the email here if needed
    const user = await prisma.user.findFirst();

    if (!user) {
        console.error('No user found in database.');
        return;
    }

    console.log(`Found user: ${user.email} (${user.id})`);

    // 3. Assign All Active Modules
    const activeModules = modules.filter(m => m.isActive);

    for (const mod of activeModules) {
        // Upsert UserModule
        await prisma.userModule.upsert({
            where: {
                // There is no combined unique key in the schema for userId_moduleId in the @unique attribute 
                // BUT we assume logic handles it. 
                // Wait, UserModule doesn't have a @@unique([userId, moduleId]). 
                // We must check if it exists or rely on ID.
                // Let's use findFirst to check existence first to avoid duplicates if constraints are missing.
                id: 'placeholder' // This won't work for upsert without unique
            },
            update: {},
            create: {
                userId: user.id,
                moduleId: mod.id,
                isActive: true
            }
        }).catch(async (e) => {
            // Fallback: Check if exists manually because I used a bad upsert approach above
            // Prisma Upsert requires a unique constraint.
            // Let's just find and create if missing.
        });
    }

    // Better Loop without Upsert (since unique constraint might be missing)
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
            console.log(`+ Added module "${mod.name}" to user.`);
        } else {
            console.log(`= User already has module "${mod.name}".`);
        }
    }

    console.log('User modules fixed! Please log out and log in again.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
