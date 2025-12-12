import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();

const prisma = new PrismaClient();
const ETSY_API_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';

async function debugEtsy() {
    console.log('--- Etsy Shop Search by Name ---');
    try {
        // Need any valid user for token
        const user = await prisma.user.findFirst({
            where: { etsyAccessToken: { not: null } }
        });

        if (!user || !user.etsyAccessToken) {
            console.log('❌ No token available');
            return;
        }

        console.log(`Using Token from: ${user.email}`);

        const client = axios.create({
            baseURL: 'https://openapi.etsy.com/v3',
            headers: {
                'x-api-key': ETSY_API_KEY,
                'Authorization': `Bearer ${user.etsyAccessToken}`
            }
        });

        const targetName = 'DekoWeltenDE';
        console.log(`Searching for shop name: ${targetName}...`);

        try {
            const r = await client.get(`/application/shops?shop_name=${targetName}`);
            if (r.data.count > 0) {
                const shop = r.data.results[0];
                console.log(`✅ FOUND Shop! ID: ${shop.shop_id}, Name: ${shop.shop_name}, UserID: ${shop.user_id}`);

                // Update ALL users involved
                await updateUsers(String(shop.shop_id), shop.shop_name);
                return;
            } else {
                console.log('❌ Shop not found by name.');
            }
        } catch (e: any) {
            console.log(`   Search Failed: ${e.message}`);
            if (e.response) console.log(`   Data: ${JSON.stringify(e.response.data)}`);
        }

    } catch (e) { console.error(e); }
    finally { await prisma.$disconnect(); }
}

async function updateUsers(shopId: string, shopName: string) {
    console.log(`>> UPDATING USERS with ShopID=${shopId}...`);

    // Update Waltraud
    const waltraud = await prisma.user.findFirst({ where: { email: { contains: 'waltraud' } } });
    if (waltraud) {
        await prisma.user.update({
            where: { id: waltraud.id },
            data: { etsyShopId: shopId, shopName: shopName }
        });
        console.log('✅ Waltraud Updated.');
    }

    // Update Michael
    const michael = await prisma.user.findFirst({ where: { email: { contains: 'michaelc' } } });
    if (michael) {
        await prisma.user.update({
            where: { id: michael.id },
            data: { etsyShopId: shopId, shopName: shopName }
        });
        console.log('✅ Michael Updated.');
    }
}

debugEtsy();
