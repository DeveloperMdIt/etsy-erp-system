import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import prisma from '../utils/prisma';

dotenv.config();

// Helper to get SMTP settings
const getTransporterConfig = async () => {
    // Try individual system settings first
    const host = await prisma.systemSetting.findUnique({ where: { key: 'SMTP_HOST' } });
    const port = await prisma.systemSetting.findUnique({ where: { key: 'SMTP_PORT' } });
    const user = await prisma.systemSetting.findUnique({ where: { key: 'SMTP_USER' } });
    const pass = await prisma.systemSetting.findUnique({ where: { key: 'SMTP_PASS' } });

    // Fallback to env
    const smtpHost = host?.value || process.env.SMTP_HOST;
    const smtpPort = port?.value ? parseInt(port.value) : parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = user?.value || process.env.SMTP_USER;
    const smtpPass = pass?.value || process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
        return {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        };
    }
    return null;
};

export const EmailService = {
    async sendMail(to: string, subject: string, html: string) {
        const config = await getTransporterConfig();

        if (config) {
            const transporter = nodemailer.createTransport(config);
            try {
                // Get From Address
                const fromSetting = await prisma.systemSetting.findUnique({ where: { key: 'SUPPORT_EMAIL' } });
                const fromAddress = fromSetting?.value || process.env.SUPPORT_EMAIL || config.auth.user;
                const shopName = process.env.SHOP_NAME || 'Inventivy';

                const info = await transporter.sendMail({
                    from: `"${shopName}" <${fromAddress}>`,
                    to,
                    subject,
                    html,
                });
                console.log('Message sent: %s', info.messageId);
                return { success: true, messageId: info.messageId };
            } catch (error) {
                console.error('Error sending email:', error);
                throw error;
            }
        } else {
            console.log('--- EMAIL SIMULATION (No credentials found) ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Content:', html);
            console.log('------------------------');
            return { success: true, simulated: true };
        }
    }
};
