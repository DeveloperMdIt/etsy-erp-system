import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import { ActivityLogService, LogType, LogAction } from '../services/activity-log.service';
import { EmailService } from '../services/email.service';
import crypto from 'crypto';

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

        // Send Welcome Email
        try {
            await EmailService.sendMail(
                email,
                'Willkommen bei Inventivy!',
                `
                <h1>Willkommen, ${firstName || 'Benutzer'}!</h1>
                <p>Vielen Dank für deine Registrierung bei Inventivy.</p>
                <p>Dein Shop "${shopName || ''}" wurde erfolgreich angelegt.</p>
                <p>Du kannst dich jetzt einloggen und loslegen.</p>
                <br>
                <p>Viele Grüße,<br>Dein Inventivy Team</p>
                `
            );
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role
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

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT with more info
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role
        }, JWT_SECRET, { expiresIn: '7d' });

        // Log successful login
        await ActivityLogService.log(
            LogType.SUCCESS,
            LogAction.LOGIN,
            `User ${user.email} logged in`,
            user.id,
            user.tenantId
        );

        res.json({
            token, user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                shopName: user.shopName,
                role: user.role,
                tenantId: user.tenantId
            }
        });
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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Put extra delay to prevent timing attacks? 
            // Return success even if user not found to prevent enumeration
            return res.json({ message: 'If the email exists, a reset link has been sent.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcrypt.hash(resetToken, SALT_ROUNDS); // Option: hash it in DB

        // Actually, for simplicity in this stack, let's store the plain token or a fast hash? 
        // Standard practice: Store Hash in DB, send Plain to User.
        // We defined 'resetPasswordToken' in schema. Let's store the hashed version only if we want to be very secure.
        // But for this project size, let's store it directly or hash it. 
        // Let's store the plain token for now to ensure matching works easily without bcrypt issues on comparison if we aren't careful.
        // BETTER: Store the token as is (it's random enough) OR hash it. 
        // Let's use the schema: resetPasswordToken

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
            }
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`;

        await EmailService.sendMail(
            email,
            'Passwort zurücksetzen',
            `
            <h1>Passwort zurücksetzen</h1>
            <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
            <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Dieser Link ist 1 Stunde gültig.</p>
            <p>Falls du das nicht warst, ignoriere diese Email einfach.</p>
            `
        );

        res.json({ message: 'If the email exists, a reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user ||
            !user.resetPasswordToken ||
            user.resetPasswordToken !== token ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        await EmailService.sendMail(
            email,
            'Passwort erfolgreich geändert',
            `
            <h1>Passwort geändert</h1>
            <p>Dein Passwort wurde erfolgreich geändert.</p>
            <p>Du kannst dich jetzt mit dem neuen Passwort anmelden.</p>
            `
        );

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
