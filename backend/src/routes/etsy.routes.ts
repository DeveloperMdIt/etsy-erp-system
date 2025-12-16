import { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';
import axios from 'axios';
import { rateLimitedGet } from '../utils/etsy-rate-limiter';

const router = Router();

// Keys from user provided image/env
const REDIRECT_URI = process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/api/etsy/callback` : 'https://inventivy.de/api/etsy/callback'; // Use env or prod default
const FRONTEND_BASE = process.env.FRONTEND_URL || 'https://inventivy.de';
const FRONTEND_URL = `${FRONTEND_BASE.replace(/\/$/, '')}/settings/channels`; // Ensure no double slash and append path

// Helper to get keys from DB
async function getEtsyKeys() {
    const clientIdSetting = await prisma.systemSetting.findUnique({ where: { key: 'ETSY_CLIENT_ID' } });
    const clientSecretSetting = await prisma.systemSetting.findUnique({ where: { key: 'ETSY_CLIENT_SECRET' } });

    return {
        key: clientIdSetting?.value || process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz',
        secret: clientSecretSetting?.value || process.env.ETSY_API_SECRET || 'pzyf6gxz4z'
    };
}

// 1. Status Check
router.get('/status', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id; // Correct property

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return res.sendStatus(401);

        res.json({
            isConnected: !!user.etsyAccessToken,
            shopName: user.shopName
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Error' });
    }
});

// 2. Init OAuth
router.get('/connect', authenticateToken as any, async (req: any, res: Response) => {
    // Generate State & Challenge
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // Store verifier/state temporarily in cookies
    res.cookie('etsy_auth_state', state, { httpOnly: true, maxAge: 300000, path: '/' });
    res.cookie('etsy_auth_verifier', codeVerifier, { httpOnly: true, maxAge: 300000, path: '/' });
    res.cookie('etsy_auth_userid', req.user.id, { httpOnly: true, maxAge: 300000, path: '/' });

    const scopes = [
        'listings_r', 'listings_w',
        'transactions_r', 'transactions_w',
        'shops_r', 'shops_w',
        'address_r', 'billing_r',
        'profile_r', 'email_r',
        'favorites_r'
    ].join(' ');

    const { key: etsyClientId } = await getEtsyKeys();

    const authUrl = `https://www.etsy.com/oauth/connect?` +
        `response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&client_id=${etsyClientId}` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

    res.json({ url: authUrl });
});

// 3. Callback
router.get('/callback', async (req: Request, res: Response) => {
    const { code, state, error } = req.query;
    const storedState = req.cookies['etsy_auth_state'];
    const codeVerifier = req.cookies['etsy_auth_verifier'];
    const userId = req.cookies['etsy_auth_userid'];

    if (error) {
        return res.redirect(`${FRONTEND_URL}?error=${error}`);
    }

    if (!code || !state || state !== storedState || !codeVerifier || !userId) {
        return res.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }

    try {
        console.log('🔵 OAuth Callback - Code received:', code);

        // Exchange code for token
        const { key: etsyClientId } = await getEtsyKeys();

        const tokenResponse = await axios.post('https://api.etsy.com/v3/public/oauth/token', {
            grant_type: 'authorization_code',
            client_id: etsyClientId,
            redirect_uri: REDIRECT_URI,
            code: code as string,
            code_verifier: codeVerifier
        }); // ... existing logic ...

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        console.log('🔵 Token Response Data:', JSON.stringify(tokenResponse.data, null, 2));

        // Get User Info (Identity)
        const userResp = await rateLimitedGet(`https://api.etsy.com/v3/application/users/${tokenResponse.data.access_token.split('.')[0]}`, {
            headers: {
                'x-api-key': etsyClientId,
                'Authorization': `Bearer ${access_token}`
            }
        });

        const userIdEtsy = userResp.data.user_id;

        console.log('✅ Etsy User ID:', userIdEtsy);

        // Fetch Shop
        console.log('🔵 Fetching Etsy shop info...');
        let shopId = null;
        let shopName = 'Verbundener Shop';

        try {
            const shopResp = await rateLimitedGet(`https://api.etsy.com/v3/application/users/${userIdEtsy}/shops`, {
                headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${access_token}` }
            });

            if (shopResp.data.count > 0) {
                const shop = shopResp.data.results[0];
                shopId = shop.shop_id.toString();
                shopName = shop.shop_name;
                console.log(`✅ Shop Found via User ID: ${shopName} (${shopId})`);
            }
        } catch (e: any) { console.log('   /shops failed:', e.message); }

        if (!shopId) {
            console.log('🔵 Fallback: Trying /application/shops/{userIdEtsy} ...');
            try {
                const r = await rateLimitedGet(`https://api.etsy.com/v3/application/shops/${userIdEtsy}`, {
                    headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${access_token}` }
                });
                if (r.data) {
                    shopId = r.data.shop_id?.toString();
                    shopName = r.data.shop_name;
                    console.log(`✅ Shop Found via Shop=User ID: ${shopName} (${shopId})`);
                }
            } catch (e) { }
        }

        // Fallback 3: Search Shop by DB Shop Name (Dynamic)
        if (!shopId) {
            try {
                // Fetch user to get stored Shop Name
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                const searchName = dbUser?.shopName;

                if (searchName) {
                    console.log(`🔵 Fallback: Searching for Shop Name '${searchName}'...`);
                    const r = await axios.get(`https://openapi.etsy.com/v3/application/shops?shop_name=${encodeURIComponent(searchName)}`, {
                        headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${access_token}` }
                    });

                    // Filter by user_id to be safe (if possible) or take best match
                    // Note: 'results' contains shops.
                    const matches = r.data.results?.filter((s: any) => s.user_id == userIdEtsy);

                    if (matches && matches.length > 0) {
                        shopId = matches[0].shop_id.toString();
                        shopName = matches[0].shop_name;
                        console.log(`✅ Shop Found via DB Name Search: ${shopName} (${shopId})`);
                    } else if (r.data.count === 1) {
                        console.log(`⚠️ Shop found by name '${searchName}' but User ID mismatch. Expected ${userIdEtsy}, found ${r.data.results[0].user_id}`);
                    }
                }
            } catch (e) { console.log('   Search by DB Name failed', e); }
        }

        // Fallback 4: DekoWeltenDE Hardcode (Legacy/Safety for Michael)
        if (!shopId) {
            console.log('🔵 Fallback: Searching for DekoWeltenDE...');
            try {
                const r = await axios.get(`https://openapi.etsy.com/v3/application/shops?shop_name=DekoWeltenDE`, {
                    headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${access_token}` }
                });
                const matches = r.data.results?.filter((s: any) => s.user_id == userIdEtsy);
                if (matches && matches.length > 0) {
                    shopId = matches[0].shop_id.toString();
                    shopName = matches[0].shop_name;
                    console.log(`✅ Shop Found via Name Search: ${shopName} (${shopId})`);
                }
            } catch (e) { }
        }

        // Update DB
        console.log('🔵 Updating database...');
        console.log('   - User ID:', userId);
        console.log('   - Access Token:', access_token?.substring(0, 20) + '...');
        console.log('   - Shop ID:', shopId);
        console.log('   - Shop Name:', shopName);

        await prisma.user.update({
            where: { id: userId },
            data: {
                etsyAccessToken: access_token,
                etsyRefreshToken: refresh_token,
                tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
                etsyUserId: userIdEtsy.toString(),
                etsyShopId: shopId,
                shopName: shopName
            }
        });

        // Also update UserSettings to be consistent
        await prisma.userSettings.upsert({
            where: { userId },
            create: {
                userId,
                etsyShopName: shopName,
                etsySyncEnabled: true
            },
            update: {
                etsyShopName: shopName,
                etsySyncEnabled: true
            }
        });

        console.log('✅ Database updated successfully!');

        // Cleanup cookies
        res.clearCookie('etsy_auth_state', { path: '/' });
        res.clearCookie('etsy_auth_verifier', { path: '/' });
        res.clearCookie('etsy_auth_userid', { path: '/' });

        res.redirect(`${FRONTEND_URL}?success=true`);

    } catch (e: any) {
        console.error('Etsy connection error', e.response?.data || e);
        const errorDetails = e.response?.data?.error || e.message;
        res.redirect(`${FRONTEND_URL}?error=token_exchange_failed&details=${encodeURIComponent(JSON.stringify(errorDetails))}`);
    }
});

// 4. Disconnect
router.post('/disconnect', authenticateToken as any, async (req: any, res: Response) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                etsyAccessToken: null,
                etsyRefreshToken: null,
                tokenExpiresAt: null,
                etsyUserId: null,
                etsyShopId: null
            }
        });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Disconnect failed' });
    }
});

// 5. Manual Sync - Orders
router.post('/sync-orders', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const tenantId = req.user.tenantId;

        const { CronService } = await import('../services/cron.service');
        const { default: ImportStatusService } = await import('../services/import-status.service');

        // Reset status before starting
        ImportStatusService.reset(tenantId);
        ImportStatusService.start(tenantId, 0, 'Initialisiere Synchronisation...');

        // Run in background so we can return response immediately and let frontend poll
        CronService.runEtsySync({ id: userId, tenantId }).catch(err => {
            console.error("Background Sync Failed:", err);
            ImportStatusService.error(tenantId, err.message);
        });

        res.json({ message: 'Bestellungs-Synchronisation wurde gestartet', type: 'orders' });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: 'Sync fehlgeschlagen', details: e.message });
    }
});

// 6. Manual Sync - Products  
router.post('/sync-products', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const tenantId = req.user.tenantId;

        const { CronService } = await import('../services/cron.service');
        const { ActivityLogService, LogType, LogAction } = await import('../services/activity-log.service');

        // Log Start
        await ActivityLogService.log(
            LogType.INFO,
            'IMPORT_PRODUCTS' as any,
            'Produkt-Import im Hintergrund gestartet...',
            userId,
            tenantId
        );

        // Run in background (Fire & Forget)
        CronService.runProductSync({ id: userId, tenantId }).catch(e => console.error(e));

        res.json({
            message: 'Produkt-Import wurde im Hintergrund gestartet.',
            type: 'products',
            details: { count: 0, background: true }
        });

    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: 'Sync Start fehlgeschlagen', details: e.message });
    }
});

export default router;
