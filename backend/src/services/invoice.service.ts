import { PrismaClient, DocumentTemplate } from '@prisma/client';
import { PdfRendererService } from './pdf-renderer.service';
import { NumberRangeService } from './number-range.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const numberRangeService = new NumberRangeService();

export class InvoiceService {

    static async createInvoice(orderId: string, userId: string, tenantId: string): Promise<string> {
        console.log(`[Invoice] Creating Invoice for Order ${orderId}`);

        // 1. Fetch Order
        const order = await prisma.order.findUnique({
            where: { id: orderId, tenantId },
            include: {
                items: { include: { product: true } },
                customer: true
            }
        });
        if (!order) throw new Error('Order not found');

        // 2. Fetch User Settings
        const settings = await prisma.userSettings.findUnique({ where: { userId } });
        if (!settings) throw new Error('Settings not found');

        // 3. Fetch Default Invoice Template
        let template = await prisma.documentTemplate.findFirst({
            where: { tenantId, type: 'INVOICE', isActive: true, isDefault: true }
        });

        // Fallback if no template (create a dummy one in memory)
        if (!template) {
            template = {
                content: 'Vielen Dank für Ihren Einkauf, {firstName}!',
                footerText: '',
                headerText: '',
                logoPosition: 'RIGHT',
                // ... other required fields default
            } as DocumentTemplate;
        }

        // 4. Generate Number
        const invoiceNumber = await numberRangeService.generateNumber('INVOICE', userId);

        // 5. Render PDF
        const pdfBuffer = await PdfRendererService.generatePdf({
            order,
            settings,
            template,
            type: 'INVOICE',
            documentNumber: invoiceNumber
        });

        // 6. Save File
        const filename = `invoice-${invoiceNumber}.pdf`;
        const uploadDir = path.join(__dirname, '../../uploads/invoices');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, pdfBuffer);

        // 7. Create Document Record
        await prisma.document.create({
            data: {
                tenantId,
                orderId,
                type: 'INVOICE',
                documentNumber: invoiceNumber,
                filePath: `/uploads/invoices/${filename}`
            }
        });

        console.log(`[Invoice] Created ${filename}`);
        return `/uploads/invoices/${filename}`;
    }
}
