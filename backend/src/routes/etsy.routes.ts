import { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';
import axios from 'axios';
import { rateLimitedGet } from '../utils/etsy-rate-limiter';

import multer from 'multer';
import { EtsyCsvService } from '../services/etsy-csv.service';

const upload = multer({ dest: 'uploads/' });

// ... existing routes ...

// CSV Import Route
router.post(
    '/import-csv',
    authenticateToken,
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
            }

            const result = await EtsyCsvService.processCsvUpload(req.file.path);
            res.json(result);
        } catch (error) {
            console.error('CSV Import Error:', error);
            res.status(500).json({ error: 'Import fehlgeschlagen.' });
        }
    }
);

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

// 1. Status Check & Scope Verification
router.get('/status', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.etsyAccessToken) {
            return res.json({ isConnected: false });
        }

        // Verify Token & Get Scopes by PROBING actual permissions
        // (Headers are unreliable, so we try to fetch protected data)
        const { key: etsyClientId } = await getEtsyKeys();
        let scopes: string[] = [];
        let probeLog: string[] = [];

        try {
            // 1. Check 'profile_r' and 'email_r'
            const userUrl = `https://api.etsy.com/v3/application/users/${user.etsyUserId}`;
            const userResp = await axios.get(userUrl, {
                headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${user.etsyAccessToken}` }
            });
            probeLog.push(`User Check: ${userResp.status}`);

            // If we got here, we have basic access
            scopes.push('profile_r');

            // Check for email
            if (userResp.data && (userResp.data.primary_email || userResp.data.email)) {
                scopes.push('email_r');
                probeLog.push('Email found -> email_r OK');
            } else {
                probeLog.push('Email missing -> email_r FAILED');
            }

            // 2. Check 'address_r' by trying to fetch addresses
            try {
                const addrUrl = `https://api.etsy.com/v3/application/users/${user.etsyUserId}/addresses`;
                await axios.get(addrUrl, {
                    headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${user.etsyAccessToken}` }
                });
                scopes.push('address_r');
                probeLog.push('Address fetch success -> address_r OK');
            } catch (addrErr: any) {
                // 404 means "Resource not found" (User has no addresses), NOT "Forbidden".
                // So 404 implies we DO have access to look! 
                if (addrErr.response?.status === 404) {
                    scopes.push('address_r');
                    probeLog.push('Address fetch returned 404 (No addresses saved) -> Access assumed OK -> address_r OK');
                } else {
                    probeLog.push(`Address fetch failed: ${addrErr.response?.status || addrErr.message} -> address_r MISSING`);
                }
            }

            // 3. REAL-WORLD TEST: Check a Receipt for address data
            if (user.etsyShopId) {
                try {
                    const recUrl = `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/receipts?limit=1`;
                    const recResp = await axios.get(recUrl, {
                        headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${user.etsyAccessToken}` }
                    });

                    if (recResp.data.count > 0) {
                        scopes.push('transactions_r');
                        let r = recResp.data.results[0];
                        let hasAddress = !!(r.first_line || r.city || r.zip || r.formatted_address);

                        if (!hasAddress) {
                            probeLog.push(`Receipt Test: List View missing address. Trying Single Fetch for ${r.receipt_id}...`);
                            try {
                                const singleUrl = `https://api.etsy.com/v3/application/shops/${user.etsyShopId}/receipts/${r.receipt_id}`;
                                const singleResp = await axios.get(singleUrl, {
                                    headers: { 'x-api-key': etsyClientId, 'Authorization': `Bearer ${user.etsyAccessToken}` }
                                });
                                r = singleResp.data;
                                hasAddress = !!(r.first_line || r.city || r.zip || r.formatted_address);
                                probeLog.push(`Receipt Test (Single): Found. Has Address: ${hasAddress ? 'YES' : 'NO'}`);
                            } catch (singleErr: any) {
                                probeLog.push(`Receipt Test (Single) Failed: ${singleErr.message}`);
                            }
                        } else {
                            probeLog.push(`Receipt Test: Found Receipt ${r.receipt_id}. Has Address Data: YES (List View)`);
                        }

                        if (hasAddress) {
                            // If we see address in receipt, we DEFINITELY have address_r
                            if (!scopes.includes('address_r')) scopes.push('address_r');
                        } else {
                            probeLog.push('WARNING: Receipt found but address data is NULL. Scope might be active but limited?');
                        }
                    } else {
                        probeLog.push('Receipt Test: No receipts found in shop.');
                        // Assume OK if we could at least query
                        scopes.push('transactions_r');
                    }
                } catch (recErr: any) {
                    probeLog.push(`Receipt Test Failed: ${recErr.message}`);
                }
            } else {
                probeLog.push('Skipping Receipt Test: No Shop ID linked.');
            }

            // 4. Assume others if basic worked
            if (scopes.includes('profile_r') || scopes.includes('address_r')) {
                const inferredScopes = ['listings_r', 'transactions_r', 'shops_r', 'billing_r', 'favorites_r'];
                inferredScopes.forEach(s => {
                    if (!scopes.includes(s)) scopes.push(s);
                });
            }

        } catch (apiErr: any) {
            console.error('Probe failed:', apiErr.message);
            if (apiErr.response?.status === 401) {
                // TOKEN EXPIRED - ATTEMPT REFRESH
                if (user.etsyRefreshToken) {
                    console.log('🔄 Probe: Token expired. Refreshing...');
                    try {
                        const { EtsyApiService } = await import('../services/etsy-api.service');
                        await EtsyApiService.refreshAccessToken(userId, user.etsyRefreshToken);
                        // Recursive retry or just allow "false" for now but next time it works?
                        // Better: Signal that it renewed so frontend can reload? 
                        // For now, let's just return isConnected: true but with a warning, OR simple recursion.
                        // Recursion is tricky in this structure.
                        // Let's Just return "isConnected: true" (optimistic) because we refreshed it!
                        console.log('✅ Probe: Token successfully refreshed.');
                        // We can't easily re-run the whole probe logic without refactoring.
                        // But we know we are connected now.
                        return res.json({
                            isConnected: true,
                            shopName: user.shopName,
                            scopes: scopes, // Might be empty but that's ok to re-probe next time
                            debugInfo: { version: 'DIAGNOSTIC-V3-REFRESHED' }
                        });
                    } catch (refreshErr) {
                        return res.json({ isConnected: false, error: 'Token refresh failed' });
                    }
                } else {
                    return res.json({ isConnected: false, error: 'Token expired' });
                }
            }
        }

        res.setHeader('Cache-Control', 'no-store, max-age=0'); // DISABLE CACHING


        res.json({
            isConnected: true,
            shopName: user.shopName,
            scopes: scopes,
            debugInfo: {
                version: 'DIAGNOSTIC-V3',
                hasScopes: scopes.length > 0,
                probeLog: probeLog,
                error: !scopes.includes('address_r') ? 'Address Scope Missing' : null
            }
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

    console.log('🔍 [OAuth Debug] Generated Auth URL:', authUrl);
    console.log('🔍 [OAuth Debug] State:', state);
    console.log('🔍 [OAuth Debug] Challenge:', codeChallenge);
    console.log('🔍 [OAuth Debug] Redirect URI:', REDIRECT_URI);

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
        console.log('🔵 OAuth Callback - Code received:', code ? 'YES (Length: ' + code.length + ')' : 'NO');
        console.log('🔍 [OAuth Debug] Callback State:', state);
        console.log('🔍 [OAuth Debug] Stored State:', storedState);
        console.log('🔍 [OAuth Debug] Verifier:', codeVerifier ? 'YES' : 'NO');

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

                // CRITICAL DEBUG: Log Granted Scopes from Header
                const grantedScopes = shopResp.headers['x-oauth-scopes'] || 'UNKNOWN';
                console.log('🔐 Granted OAuth Scopes:', grantedScopes);
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

        const { fullSync } = req.body;
        console.log(`[Etsy Route] Sync requested. Full Sync: ${fullSync}`);

        const { CronService } = await import('../services/cron.service');
        const { default: ImportStatusService } = await import('../services/import-status.service');

        // Reset status before starting
        ImportStatusService.reset(tenantId);
        ImportStatusService.start(tenantId, 0, 'Initialisiere Synchronisation...');

        // Run in background so we can return response immediately and let frontend poll
        setImmediate(() => {
            CronService.runEtsySync({ id: userId, tenantId }, fullSync).catch(err => {
                console.error("Background Sync Failed:", err);
                ImportStatusService.error(tenantId, err.message);
            });
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
