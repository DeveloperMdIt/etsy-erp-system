import { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';
import axios from 'axios';

const router = Router();

// Keys from user provided image/env
const ETSY_KEY = process.env.ETSY_API_KEY || 'zm740uejm9qblnvioql0vayz';
const ETSY_SECRET = process.env.ETSY_API_SECRET || 'pzyf6gxz4z';
const REDIRECT_URI = 'http://localhost:3001/api/etsy/callback';
const FRONTEND_URL = 'http://localhost:5174/etsy-connect';

// 1. Status Check
router.get('/status', authenticateToken, async (req: any, res: Response) => {
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
router.get('/connect', authenticateToken, (req: any, res: Response) => {
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
        'profile_r', 'address_r'
    ].join(' ');

    const authUrl = `https://www.etsy.com/oauth/connect?` +
        `response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&client_id=${ETSY_KEY}` +
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
        // Exchange code for token
        const tokenResponse = await axios.post('https://api.etsy.com/v3/public/oauth/token', {
            grant_type: 'authorization_code',
            client_id: ETSY_KEY,
            redirect_uri: REDIRECT_URI,
            code: code as string,
            code_verifier: codeVerifier
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Get User Info (Identity)
        const userResp = await axios.get(`https://api.etsy.com/v3/application/users/${tokenResponse.data.access_token.split('.')[0]}`, {
            headers: {
                'x-api-key': ETSY_KEY,
                'Authorization': `Bearer ${access_token}`
            }
        });

        const userIdEtsy = userResp.data.user_id;

        // Fetch Shop
        const shopResp = await axios.get(`https://api.etsy.com/v3/application/users/${userIdEtsy}/shops`, {
            headers: {
                'x-api-key': ETSY_KEY,
                'Authorization': `Bearer ${access_token}`
            }
        });

        const shop = shopResp.data.results?.[0];
        const shopName = shop ? shop.shop_name : 'Verbundener Shop';
        const shopId = shop ? shop.shop_id.toString() : null;

        // Update DB
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
router.post('/disconnect', authenticateToken, async (req: any, res: Response) => {
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

export default router;
