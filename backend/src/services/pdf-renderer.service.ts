import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Order, OrderItem, Product, UserSettings, Customer, DocumentTemplate } from '@prisma/client';

interface RenderContext {
    order: Order & {
        items: (OrderItem & { product: Product })[],
        customer: Customer
    };
    settings: UserSettings;
    template: DocumentTemplate;
    type: 'INVOICE' | 'DELIVERY_NOTE';
    documentNumber: string;
}

export class PdfRendererService {

    /**
     * Generates a PDF buffer based on the order and template
     */
    static async generatePdf(context: RenderContext): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            try {
                // 1. Header & Logo
                this.renderHeader(doc, context);

                // 2. Sender & Recipient Address
                this.renderAddresses(doc, context);

                // 3. Document Info (Date, Number)
                this.renderDocumentInfo(doc, context);

                // 4. Intro Text (from Template)
                this.renderIntro(doc, context);

                // 5. Items Table
                this.renderTable(doc, context);

                // 6. Totals
                this.renderTotals(doc, context);

                // 7. Footer (from Template)
                this.renderFooter(doc, context);

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    private static renderHeader(doc: PDFKit.PDFDocument, { settings, template }: RenderContext) {
        // Logo
        if (settings.labelLogoPath && fs.existsSync(settings.labelLogoPath)) {
            const x = template.logoPosition === 'CENTER' ? 250 : (template.logoPosition === 'LEFT' ? 50 : 450);
            doc.image(settings.labelLogoPath, x, 40, { width: 100 });
        }

        // Header Text? (e.g. customized in template)
        if (template.headerText) {
            doc.fontSize(8).fillColor('gray').text(template.headerText, 50, 40, { width: 500, align: 'right' });
        }
    }

    private static renderAddresses(doc: PDFKit.PDFDocument, { settings, order }: RenderContext) {
        // Sender line (small)
        const senderLine = `${settings.labelCompanyName || ''} • ${settings.labelStreet || ''} • ${settings.labelPostalCode || ''} ${settings.labelCity || ''}`;
        doc.fontSize(8).fillColor('#444').text(senderLine, 50, 130, { underline: true });

        // Recipient Address
        doc.fontSize(10).fillColor('black').moveDown();
        doc.text(order.customer.firstName + ' ' + order.customer.lastName, 50, 150);
        doc.text(order.customer.street + ' ' + (order.customer.addressAddition || ''));
        doc.text(order.customer.postalCode + ' ' + order.customer.city);
        doc.text(order.customer.country);
    }

    private static renderDocumentInfo(doc: PDFKit.PDFDocument, { type, documentNumber, order }: RenderContext) {
        // Right side info block
        const startY = 150;
        const startX = 400;

        const title = type === 'INVOICE' ? 'RECHNUNG' : 'LIEFERSCHEIN';
        doc.fontSize(16).font('Helvetica-Bold').text(title, startX, startY - 30);

        doc.fontSize(10).font('Helvetica');
        doc.text(`Nummer: ${documentNumber}`, startX, startY);
        doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, startX, startY + 15);
        if (order.externalOrderId) {
            doc.text(`Bestell-Nr.: ${order.externalOrderId}`, startX, startY + 30);
        }
        doc.text(`Kunden-Nr.: ${order.customer.customerNumber}`, startX, startY + 45);
    }

    private static renderIntro(doc: PDFKit.PDFDocument, { template, order }: RenderContext) {
        const y = 250;
        if (template.content) {
            // Replace placeholders
            let text = template.content
                .replace('{firstName}', order.customer.firstName)
                .replace('{lastName}', order.customer.lastName);

            doc.fontSize(10).text(text, 50, y, { width: 500 });
        }
    }

    private static renderTable(doc: PDFKit.PDFDocument, { order }: RenderContext) {
        let y = 300;
        const colX = { pos: 50, sku: 90, name: 180, qty: 400, price: 450, total: 500 };

        // Headers
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Pos', colX.pos, y);
        doc.text('Art.-Nr.', colX.sku, y);
        doc.text('Bezeichnung', colX.name, y);
        doc.text('Menge', colX.qty, y);
        doc.text('Einzel', colX.price, y);
        doc.text('Gesamt', colX.total, y);

        // Line
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        y += 25;

        // Items
        doc.font('Helvetica');
        let pos = 1;

        for (const item of order.items) {
            doc.text(pos.toString(), colX.pos, y);
            doc.text(item.product.sku, colX.sku, y);
            doc.text(item.product.name.substring(0, 40), colX.name, y, { width: 200 });
            doc.text(item.quantity.toString(), colX.qty, y);
            doc.text(item.price.toFixed(2) + ' €', colX.price, y);
            doc.text((item.quantity * item.price).toFixed(2) + ' €', colX.total, y);

            y += 20;
            pos++;
        }

        // Bottom Line
        doc.moveTo(50, y).lineTo(550, y).stroke();
    }

    private static renderTotals(doc: PDFKit.PDFDocument, { order }: RenderContext) {
        const y = doc.y + 20;
        const startX = 400;

        doc.fontSize(10);
        doc.text('Zwischensumme:', startX, y);
        doc.text((order.totalPrice - order.shippingCost).toFixed(2) + ' €', 500, y);

        doc.text('Versandkosten:', startX, y + 15);
        doc.text(order.shippingCost.toFixed(2) + ' €', 500, y + 15);

        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Gesamtsumme:', startX, y + 35);
        doc.text(order.totalPrice.toFixed(2) + ' €', 500, y + 35);
    }

    private static renderFooter(doc: PDFKit.PDFDocument, { template, settings }: RenderContext) {
        const bottomY = 750;

        // Divider
        doc.moveTo(50, bottomY).lineTo(550, bottomY).stroke();

        // Footer Text (Template > Settings > Default)
        let text = template.footerText || '';
        if (!text) {
            text = `${settings.labelCompanyName || ''} | ${settings.labelStreet || ''} | ${settings.labelCity || ''}`;
        }

        doc.fontSize(8).font('Helvetica').text(text, 50, bottomY + 10, { align: 'center', width: 500 });

        // Page Numbers
        const range = doc.bufferedPageRange(); // { start: 0, count: 1 }
        // Note: pdfkit handles page numbers manually usually, keeping it simple here for 1-pagers
    }
}
