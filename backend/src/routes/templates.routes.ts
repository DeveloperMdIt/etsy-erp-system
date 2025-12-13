import { Router } from 'express';
import { EmailService } from '../services/email.service';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all templates for the current tenant
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID missing' });

        const templates = await prisma.documentTemplate.findMany({
            where: { tenantId }
        });

        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get/Find a specific template by TYPE (e.g. for "Edit Invoice Template" button)
// If it doesn't exist, we might return 404 or a default structure
router.get('/by-type/:type', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { type } = req.params;

        if (!tenantId) return res.status(400).json({ error: 'Tenant ID missing' });

        // Try to find existing
        let template = await prisma.documentTemplate.findFirst({
            where: { tenantId, type }
        });

        if (!template) {
            // Return a stub/default if not found, frontend can then "create" it on save
            // Or we could auto-create it here. Let's return 404 for now and let frontend handle "New" state
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching template by type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update or Create (Upsert-ish logic)
router.post('/save', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const userId = req.user?.id;
        const { type, name, subject, content, headerText, footerText } = req.body;

        if (!tenantId || !userId) return res.status(401).json({ error: 'Unauthorized' });

        // Check if exists
        const existing = await prisma.documentTemplate.findFirst({
            where: { tenantId, type }
        });

        let template;

        if (existing) {
            template = await prisma.documentTemplate.update({
                where: { id: existing.id },
                data: {
                    name,
                    subject,
                    content,
                    headerText,
                    footerText,
                    updatedAt: new Date()
                }
            });
        } else {
            template = await prisma.documentTemplate.create({
                data: {
                    tenantId,
                    userId,
                    type,
                    name: name || type, // Fallback name
                    subject,
                    content: content || '',
                    headerText,
                    footerText
                }
            });
        }

        res.json(template);
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper to replace variables with dummy data
const replaceVariables = (text: string) => {
    let result = text;
    const dummies: Record<string, string> = {
        '{BuyerName}': 'Max Mustermann',
        '{BuyerFirstName}': 'Max',
        '{BuyerLastName}': 'Mustermann',
        '{OrderRef}': 'ORD-2025-1001',
        '{InvoiceNumber}': 'INV-2025-001',
        '{OrderDate}': new Date().toLocaleDateString('de-DE'),
        '{ShopName}': 'Mein Toller Shop',
        '{GrandTotal}': '29,99 €',
        '{PaymentMethod}': 'PayPal',
        '{PayDate}': new Date().toLocaleDateString('de-DE'),
        '{TrackingCode}': '003404342232355',
        '{TrackingUrl}': 'https://dhl.de/tracking/003404342232355',
        '{TrackingNumber}': '003404342232355',
        '{TrackingLink}': 'https://dhl.de/tracking/003404342232355',
    };

    // Handle Conditional Blocks first (simple version)
    // Regex for {Block} content {/Block}
    const trackingBlockRegex = /\{TrackingNumberAvailable\}([\s\S]*?)\{\/TrackingNumberAvailable\}/g;
    // For test, we assume tracking IS available
    result = result.replace(trackingBlockRegex, '$1');

    // Replace plain variables
    for (const [key, val] of Object.entries(dummies)) {
        // global replace
        result = result.split(key).join(val);
    }
    return result;
};

router.post('/send-test', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { subject, content, type } = req.body; // we receive the raw content/subject from editor

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Replace variables with dummy data
        const finalSubject = replaceVariables(subject || '');
        const finalContent = replaceVariables(content || '');

        // Use user's email as recipient for test
        const recipient = user.email;

        // Try to send
        const result = await EmailService.sendMail(recipient, finalSubject, finalContent);

        res.json(result);

    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

export const templatesRouter = router;
