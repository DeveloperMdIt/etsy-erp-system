// Seed Modules for Subscription
// Usage: npx ts-node seed_modules.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modules = [
    {
        key: 'MODULE_ORDER_MGMT',
        name: 'Auftragsabwicklung',
        description: 'Verwaltung von Bestellungen, Kunden und Versandlabels via DHL & Deutsche Post.',
        category: 'Basis',
        price: 19.90,
        isActive: true,
        isPlanned: false
    },
    {
        key: 'MODULE_AUTOMATION',
        name: 'Automatisierung',
        description: 'Erstelle Regeln um Aufgaben automatisch zu erledigen (z.B. "Wenn bezahlt, dann Rechnung senden").',
        category: 'Erweiterung',
        price: 9.90,
        isActive: true,
        isPlanned: false
    },
    {
        key: 'MODULE_ETSY_SYNC',
        name: 'Etsy Integration',
        description: 'Automatische Synchronisation von Bestellungen und Lagerbeständen mit Etsy.',
        category: 'Kanal',
        price: 0.00, // Included or separate? Let's make it 0 for now as it's core.
        isActive: true,
        isPlanned: false
    },
    {
        key: 'MODULE_LABEL_DESIGNER',
        name: 'Label Designer',
        description: 'Erstelle individuelle Versandetiketten und Dokumentvorlagen.',
        category: 'Design',
        price: 4.90,
        isActive: true,
        isPlanned: true // Maybe later?
    }
];

async function main() {
    console.log('Seeding modules...');

    for (const mod of modules) {
        await prisma.module.upsert({
            where: { key: mod.key },
            update: mod,
            create: mod
        });
        console.log(`- Upserted: ${mod.name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
