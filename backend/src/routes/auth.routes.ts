import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import { ActivityLogService, LogType, LogAction } from '../services/activity-log.service';
import { EmailService } from '../services/email.service';
import crypto from 'crypto';


const router = Router();
// const prisma = new PrismaClient(); // Removed local instance

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

    // Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user and default settings transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: firstName || null,
          lastName: lastName || null,
          shopName: shopName || null,
          isVerified: false, // Default false
          verificationToken: verificationToken
        },
      });

      await tx.userSettings.create({
        data: {
          userId: newUser.id,
          orderNumberFormat: 'BE-{YYYY}-{####}',
          invoiceNumberFormat: 'RE-{YYYY}-{####}',
          deliveryNoteFormat: 'LS-{YYYY}-{####}',
          customerNumberFormat: 'KD-{YYYY}-{####}',
        }
      });

      return newUser;
    });

    // Send Verification Email
    const verificationLink = `${process.env.FRONTEND_URL || 'https://inventivy.de'}/verify-email?token=${verificationToken}&email=${email}`;

    try {
      const subjectSetting = await prisma.systemSetting.findUnique({ where: { key: 'SYSTEM_EMAIL_VERIFY_SUBJECT' } });
      const contentSetting = await prisma.systemSetting.findUnique({ where: { key: 'SYSTEM_EMAIL_VERIFY_CONTENT' } });

      let subject = subjectSetting?.value || 'E-Mail bestätigen – Inventivy';
      let content = contentSetting?.value || `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>E-Mail bestätigen – Inventivy</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, sans-serif; color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7fb;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(17,24,39,0.08);">
          <tr>
            <td style="background:#111827; padding:22px 24px;">
              <img src="https://inventivy.de/logo.png" alt="Inventivy" width="150" style="display:block; border:0; max-width:100%; height:auto; margin-bottom:8px;" />
              <div style="font-size:13px; color:#e5e7eb;">E-Mail-Bestätigung</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 12px 0; font-size:22px; color:#111827;">Bitte bestätige deine E-Mail-Adresse</h1>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                Hallo <strong style="color:#111827;">{firstName} {lastName}</strong>,
              </p>
              <p style="margin:0 0 18px 0; font-size:15px; line-height:1.6; color:#374151;">
                bitte bestätige deine Anmeldung bei <strong style="color:#111827;">Inventivy</strong>, damit wir dein Konto aktivieren können.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
                <tr>
                  <td bgcolor="#f97316" style="border-radius:10px;">
                    <a href="{link}" style="display:inline-block; padding:12px 18px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:10px;">E-Mail-Adresse bestätigen</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 10px 0; font-size:13px; line-height:1.6; color:#6b7280;">
                Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
              </p>
              <p style="margin:0; font-size:13px; line-height:1.6; word-break:break-word;">
                <a href="{link}" style="color:#2563eb; text-decoration:underline;">{link}</a>
              </p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:22px 0;" />
              <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">
                Vielen Dank, dass du dich für <strong style="color:#111827;">Inventivy</strong> entschieden hast.
              </p>
              <p style="margin:10px 0 0 0; font-size:14px; line-height:1.6; color:#374151;">
                Dein Team von Inventivy
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      content = content
        .replace(/{firstName}/g, firstName || '')
        .replace(/{lastName}/g, lastName || '')
        .replace(/{link}/g, verificationLink);

      await EmailService.sendMail(email, subject, content);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Do NOT return token. Force login after verification.
    res.json({ message: 'Registration successful. Please check your email to verify your account.' });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationToken !== token) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    // Send Welcome Email
    // Send Welcome Email
    try {
      // Fetch Template
      const subjectSetting = await prisma.systemSetting.findUnique({ where: { key: 'SYSTEM_EMAIL_WELCOME_SUBJECT' } });
      const contentSetting = await prisma.systemSetting.findUnique({ where: { key: 'SYSTEM_EMAIL_WELCOME_CONTENT' } });

      let subject = subjectSetting?.value || 'Willkommen bei Inventivy!';

      // Default Content if not in DB (copy of the new default)
      let content = contentSetting?.value || `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Willkommen bei Inventivy</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, sans-serif; color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7fb;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(17,24,39,0.08);">
          <tr>
            <td style="background:#111827; padding:22px 24px;">
              <img src="https://inventivy.de/logo.png" alt="Inventivy" width="150" style="display:block; border:0; max-width:100%; height:auto; margin-bottom:8px;" />
              <div style="font-size:13px; color:#e5e7eb;">Willkommen bei Inventivy</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 14px 0; font-size:22px; color:#111827;">Willkommen!</h1>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                Sehr geehrte(r) <strong>{firstName} {lastName}</strong>,
              </p>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                wir freuen uns sehr, Sie bei <strong>Inventivy</strong> begrüßen zu dürfen.
                Vielen Dank für Ihre Registrierung und das Vertrauen in unser System.
              </p>
              <p style="margin:18px 0 0 0; font-size:15px; line-height:1.6; color:#374151;">
                Wir wünschen Ihnen viel Erfolg und Freude bei der Nutzung von Inventivy.
              </p>
              <p style="margin:12px 0 0 0; font-size:15px; line-height:1.6; color:#374151;">
                Ihr Team von <strong>Inventivy</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Replace Variables
      const firstName = user.firstName || 'Kunde';
      const lastName = user.lastName || '';

      subject = subject.replace(/{firstName}/g, firstName).replace(/{lastName}/g, lastName);
      content = content.replace(/{firstName}/g, firstName).replace(/{lastName}/g, lastName);

      await EmailService.sendMail(email, subject, content);
      console.log(`Welcome email sent to ${email}`);
    } catch (e) {
      console.error('Failed to send welcome email', e);
    }

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('DEBUG LOGIN START: ', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user - SIMPLE FETCH ONLY
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('DEBUG LOGIN: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('DEBUG LOGIN: User found', user.id);

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      console.log('DEBUG LOGIN: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('DEBUG LOGIN: Password valid. Generating token...');

    // Generate JWT
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    }, JWT_SECRET, { expiresIn: '7d' });

    console.log('DEBUG LOGIN: Token generated. Sending response.');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        shopName: user.shopName,
        role: user.role,
        tenantId: user.tenantId,
        modules: [] // Empty for now
      }
    });

  } catch (error: any) {
    console.error('CRITICAL LOGIN ERROR:', error);
    res.status(500).json({
      error: 'Login crashed',
      details: error.message,
      stack: error.stack
    });
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
        userModules: {
          where: { isActive: true },
          include: { module: true }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform response to include simple modules list
    const userWithModules = {
      ...user,
      modules: user.userModules.map((um: any) => um.module.name),
      userModules: undefined // Remove the complex object
    };

    res.json({ user: userWithModules });
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
