import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName, shopName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user and default settings transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    shopName: shopName || null,
                },
            });

            await tx.userSettings.create({
                data: {
                    userId: newUser.id,
                    orderNumberFormat: 'BE-{YYYY}-{####}',
                    invoiceNumberFormat: 'RE-{YYYY}-{####}',
                    deliveryNoteFormat: 'LS-{YYYY}-{####}',
                    customerNumberFormat: 'KD-{YYYY}-{####}',
                    // Add other defaults as needed
                }
            });

            return newUser;
        });

        // Generate JWT
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId
        }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        // Check password
        console.log(`Login attempt for ${email}`);
        console.log('--- DEBUG PASS ---');
        console.log('Type:', typeof password);
        console.log('Length:', password?.length);
        console.log('Value (JSON):', JSON.stringify(password));
        console.log('Stored Hash:', user.passwordHash.substring(0, 15) + '...');

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log(`Password valid: ${isValid}`);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT with more info
        // Generate JWT with more info
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId, // Add tenantId to token
            // role: user.role, // Need to select role first
        }, JWT_SECRET, { expiresIn: '7d' });

        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            shopName: user.shopName,
            createdAt: user.createdAt,
        };

        res.json({ user: userResponse, token });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                shopName: true,
                role: true,
                etsyShopId: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: 'Logged out successfully' });
});

export default router;
