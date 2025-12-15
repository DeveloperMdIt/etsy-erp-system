import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../utils/prisma';
import { rateLimitedGet } from '../utils/etsy-rate-limiter';

const router = Router();

// Debug endpoint to check user's Etsy tokens
router.get('/etsy-tokens', authenticateToken, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                shopName: true,
                etsyShopId: true,
                etsyUserId: true,
                etsyAccessToken: true,
                etsyRefreshToken: true,
                tokenExpiresAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            ...user,
            hasAccessToken: !!user.etsyAccessToken,
            hasRefreshToken: !!user.etsyRefreshToken,
            accessTokenLength: user.etsyAccessToken?.length || 0,
            tokenExpired: user.tokenExpiresAt ? new Date() > user.tokenExpiresAt : null
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Test Etsy Shop API
router.get('/test-shop-api', authenticateToken, async (req: any, res: Response) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.etsyAccessToken || !user.etsyUserId) {
            return res.status(400).json({ error: 'User not connected to Etsy' });
        }

        const results: any = {
            userId: user.etsyUserId,
            currentShopId: user.etsyShopId,
            tests: []
        };

        // Test 1: Try to get user info
        try {
            const userInfoResp = await rateLimitedGet(
                `https://openapi.etsy.com/v3/application/users/${user.etsyUserId}`,
                {
                    headers: {
                        'x-api-key': process.env.ETSY_KEY!,
                        'Authorization': `Bearer ${user.etsyAccessToken}`
                    }
                }
            );
            results.tests.push({
                name: 'Get User Info',
                status: 'SUCCESS',
                data: userInfoResp.data
            });
        } catch (error: any) {
            results.tests.push({
                name: 'Get User Info',
                status: 'FAILED',
                error: error.response?.data || error.message
            });
        }

        // Test 2: Try /users/{user_id}/shops
        try {
            const shopsResp = await rateLimitedGet(
                `https://openapi.etsy.com/v3/application/users/${user.etsyUserId}/shops`,
                {
                    headers: {
                        'x-api-key': process.env.ETSY_KEY!,
                        'Authorization': `Bearer ${user.etsyAccessToken}`
                    }
                }
            );
            results.tests.push({
                name: 'Get Shops by User',
                status: 'SUCCESS',
                data: shopsResp.data
            });
        } catch (error: any) {
            results.tests.push({
                name: 'Get Shops by User',
                status: 'FAILED',
                error: error.response?.data || error.message
            });
        }

        // Test 3: Try to get shop details with current shopId
        if (user.etsyShopId) {
            try {
                const shopResp = await rateLimitedGet(
                    `https://openapi.etsy.com/v3/application/shops/${user.etsyShopId}`,
                    {
                        headers: {
                            'x-api-key': process.env.ETSY_KEY!,
                            'Authorization': `Bearer ${user.etsyAccessToken}`
                        }
                    }
                );
                results.tests.push({
                    name: 'Get Shop Details (current shopId)',
                    status: 'SUCCESS',
                    data: shopResp.data
                });
            } catch (error: any) {
                results.tests.push({
                    name: 'Get Shop Details (current shopId)',
                    status: 'FAILED',
                    error: error.response?.data || error.message
                });
            }
        }

        // Test 4: Try to get listings with current shopId
        if (user.etsyShopId) {
            try {
                const listingsResp = await rateLimitedGet(
                    `https://openapi.etsy.com/v3/application/shops/${user.etsyShopId}/listings/active`,
                    {
                        headers: {
                            'x-api-key': process.env.ETSY_KEY!,
                            'Authorization': `Bearer ${user.etsyAccessToken}`
                        },
                        params: { limit: 1 }
                    }
                );
                results.tests.push({
                    name: 'Get Listings (current shopId)',
                    status: 'SUCCESS',
                    count: listingsResp.data.count,
                    data: listingsResp.data.results?.[0]
                });
            } catch (error: any) {
                results.tests.push({
                    name: 'Get Listings (current shopId)',
                    status: 'FAILED',
                    error: error.response?.data || error.message
                });
            }
        }

        // Test 5: Try with userId as shopId (fallback)
        try {
            const listingsResp = await rateLimitedGet(
                `https://openapi.etsy.com/v3/application/shops/${user.etsyUserId}/listings/active`,
                {
                    headers: {
                        'x-api-key': process.env.ETSY_KEY!,
                        'Authorization': `Bearer ${user.etsyAccessToken}`
                    },
                    params: { limit: 1 }
                }
            );
            results.tests.push({
                name: 'Get Listings (userId as shopId)',
                status: 'SUCCESS',
                count: listingsResp.data.count,
                data: listingsResp.data.results?.[0]
            });
        } catch (error: any) {
            results.tests.push({
                name: 'Get Listings (userId as shopId)',
                status: 'FAILED',
                error: error.response?.data || error.message
            });
        }

        res.json(results);
    } catch (error: any) {
        console.error('Debug API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List all registered routes
router.get('/routes', authenticateToken, (req: Request, res: Response) => {
    const listRoutes = (stack: any[], parentPath: string = ''): any[] => {
        const routes: any[] = [];
        stack.forEach((layer) => {
            if (layer.route) {
                const path = layer.route.path;
                const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
                routes.push({ path: parentPath + path, methods });
            } else if (layer.name === 'router' && layer.handle.stack) {
                // It's a router
                const regexp = layer.regexp.source;
                let path = '';
                // Simple regex parsing to find path prefix
                // Express regex: /^\/api\/auth\/?(?=\/|$)/i
                if (regexp.includes('^\\/')) {
                    path = regexp.replace('^\\/', '/').replace(/\\/g, '').replace('/?(?=/|$)/i', '');
                    // clean up more if needed, usually sufficient
                    // Actually better to use the mount path map if available, but express doesn't expose it easily on stack
                    // This is a rough estimation
                }

                // Better approach: we know where we mounted router. 
                // But from inside `router` we don't know the parent path.
                // We'll just return what we find. 
                // For this debug purpose, we just want to see if subscription-plans is there.

                routes.push(...listRoutes(layer.handle.stack, parentPath + ' -> ROUTER '));
            }
        });
        return routes;
    };

    const routes: any[] = [];
    // We need access to the main app to see all routes. 
    // Using req.app._router.stack
    if (req.app && req.app._router) {
        req.app._router.stack.forEach((middleware: any) => {
            if (middleware.route) { // routes registered directly on the app
                routes.push({
                    path: middleware.route.path,
                    method: Object.keys(middleware.route.methods).join(', ').toUpperCase()
                });
            } else if (middleware.name === 'router') { // router middleware 
                // middleware.regexp puts the path in a regex
                // middleware.handle.stack contain the routes
                routes.push({
                    prefix: middleware.regexp.toString(),
                    name: middleware.name,
                    // keys: middleware.keys 
                });
            }
        });
    }

    res.json({
        message: 'This is a rough debug view. Check server logs for better output.',
        rawStackLength: req.app._router.stack.length,
        routes
    });
});

export default router;

