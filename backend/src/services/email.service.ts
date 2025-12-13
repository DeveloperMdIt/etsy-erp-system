import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter only if credentials exist
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = parseInt(process.env.SMTP_PORT || '587');
        const secure = port === 465; // true for 465, false for other ports (587, 25)

        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return null;
};

export const EmailService = {
    async sendMail(to: string, subject: string, html: string) {
        const transporter = createTransporter();

        if (transporter) {
            try {
                const info = await transporter.sendMail({
                    from: `"${process.env.SHOP_NAME || 'Inventivy'}" <${process.env.SMTP_USER}>`,
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
            console.log('--- EMAIL SIMULATION ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Content:', html);
            console.log('------------------------');
            return { success: true, simulated: true };
        }
    }
};
