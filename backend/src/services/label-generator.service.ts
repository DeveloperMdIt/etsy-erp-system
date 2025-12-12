import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Label Generator Service
 * 
 * Generates shipping labels based on a dynamic JSON layout or presets.
 */

interface LabelSize {
    width: number;  // in mm
    height: number; // in mm
}

const LABEL_SIZES: Record<string, LabelSize> = {
    A5: { width: 148, height: 210 },
    A6: { width: 105, height: 148 },
    '4x6': { width: 101.6, height: 152.4 },
    '4x4': { width: 101.6, height: 101.6 }
};

// Convert mm to points (1mm = 2.83465 points)
const mmToPoints = (mm: number) => mm * 2.83465;

export interface LabelElement {
    id: string;
    type: 'text' | 'image' | 'barcode' | 'qrcode' | 'address_sender' | 'address_recipient';
    x: number; // in mm
    y: number; // in mm
    width?: number; // in mm
    height?: number; // in mm
    content?: string; // For static text or variable placeholders like {name}
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'bold' | 'normal';
    align?: 'left' | 'center' | 'right';
    // Address formatting
    addressFormat?: 'multiline' | 'singleline';
    addressSeparator?: string;
}

export interface LabelLayout {
    width: number; // mm
    height: number; // mm
    elements: LabelElement[];
}

interface LabelData {
    // Sender
    senderName: string;
    senderStreet: string;
    senderPostalCode: string;
    senderCity: string;
    senderCountry?: string;

    // Recipient
    recipientName: string;
    recipientStreet: string;
    recipientPostalCode: string;
    recipientCity: string;
    recipientCountry?: string;

    // Tracking
    trackingNumber: string;

    // Logo
    logoPath?: string;

    // Label size / Layout
    sizePreset?: string; // If using default hardcoded layouts
    layout?: LabelLayout; // If using custom dynamic layout
}

export class LabelGeneratorService {
    /**
     * Generate label PDF
     */
    async generateLabelPDF(data: LabelData, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Determine label size
                let widthPoints: number;
                let heightPoints: number;

                if (data.layout) {
                    widthPoints = mmToPoints(data.layout.width);
                    heightPoints = mmToPoints(data.layout.height);
                } else if (data.sizePreset && LABEL_SIZES[data.sizePreset]) {
                    const size = LABEL_SIZES[data.sizePreset];
                    widthPoints = mmToPoints(size.width);
                    heightPoints = mmToPoints(size.height);
                } else {
                    // Default A6
                    const size = LABEL_SIZES.A6;
                    widthPoints = mmToPoints(size.width);
                    heightPoints = mmToPoints(size.height);
                }

                const doc = new PDFDocument({
                    size: [widthPoints, heightPoints],
                    margins: { top: 0, bottom: 0, left: 0, right: 0 } // No auto margins, we use absolute positioning
                });

                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // --- Rendering Logic ---
                if (data.layout) {
                    // Dynamic Rendering based on Layout
                    this.renderDynamicLayout(doc, data.layout, data);
                } else {
                    // Legacy Hardcoded Rendering (Fallback)
                    this.renderLegacyLayout(doc, widthPoints, heightPoints, data);
                }

                doc.end();

                stream.on('finish', () => {
                    console.log('✅ Label PDF generated:', outputPath);
                    resolve(outputPath);
                });

                stream.on('error', (error) => {
                    console.error('❌ Failed to generate label PDF:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('❌ Label generation error:', error);
                reject(error);
            }
        });
    }

    /**
     * Render dynamic layout elements
     */
    private async renderDynamicLayout(doc: PDFKit.PDFDocument, layout: LabelLayout, data: LabelData) {
        for (const element of layout.elements) {
            const x = mmToPoints(element.x);
            const y = mmToPoints(element.y);
            const w = element.width ? mmToPoints(element.width) : undefined;
            const h = element.height ? mmToPoints(element.height) : undefined;

            try {
                switch (element.type) {
                    case 'text':
                    case 'address_sender':
                    case 'address_recipient':
                        this.renderTextElement(doc, element, x, y, w, data);
                        break;
                    case 'image': // Logo
                        if (data.logoPath && fs.existsSync(data.logoPath) && w && h) {
                            doc.image(data.logoPath, x, y, { fit: [w, h], align: 'center' });
                        }
                        break;
                    case 'barcode':
                        // TODO: Implement barcode generation if needed, usually passed as image or drawn
                        break;
                    case 'qrcode':
                        // Use tracking number for QR
                        if (data.trackingNumber && w && h) {
                            const url = await QRCode.toDataURL(data.trackingNumber);
                            doc.image(url, x, y, { width: w, height: h });
                        }
                        break;
                }
            } catch (err) {
                console.warn(`Failed to render element ${element.id}:`, err);
            }
        }
    }

    private renderTextElement(doc: PDFKit.PDFDocument, element: LabelElement, x: number, y: number, w: number | undefined, data: LabelData) {
        let text = element.content || '';

        // Variable Substitution
        text = text.replace('{senderName}', data.senderName)
            .replace('{senderStreet}', data.senderStreet)
            .replace('{senderCity}', `${data.senderPostalCode} ${data.senderCity}`)
            .replace('{recipientName}', data.recipientName)
            .replace('{recipientStreet}', data.recipientStreet)
            .replace('{recipientCity}', `${data.recipientPostalCode} ${data.recipientCity}`)
            .replace('{recipientCountry}', data.recipientCountry || '')
            .replace('{trackingNumber}', data.trackingNumber);

        // Handle special address types if content is empty but type is specific
        if (!element.content) {
            if (element.type === 'address_sender') {
                // Check if singleline format is requested
                if (element.addressFormat === 'singleline') {
                    const separator = element.addressSeparator || ', ';
                    text = `${data.senderName}${separator}${data.senderStreet}${separator}${data.senderPostalCode} ${data.senderCity}`;
                } else {
                    text = `${data.senderName}\n${data.senderStreet}\n${data.senderPostalCode} ${data.senderCity}`;
                }
            } else if (element.type === 'address_recipient') {
                // Check if singleline format is requested
                if (element.addressFormat === 'singleline') {
                    const separator = element.addressSeparator || ', ';
                    text = `${data.recipientName}${separator}${data.recipientStreet}${separator}${data.recipientPostalCode} ${data.recipientCity}${data.recipientCountry ? separator + data.recipientCountry.toUpperCase() : ''}`;
                } else {
                    text = `${data.recipientName}\n${data.recipientStreet}\n${data.recipientPostalCode} ${data.recipientCity}\n${data.recipientCountry?.toUpperCase() || ''}`;
                }
            }
        }

        // Font Settings
        if (element.fontFamily) doc.font(element.fontFamily); // Standard PDF fonts: Helvetica, Courier, Times
        else doc.font('Helvetica');

        if (element.fontWeight === 'bold') doc.font('Helvetica-Bold');

        doc.fontSize(element.fontSize || 12);

        doc.text(text, x, y, {
            width: w,
            align: element.align || 'left'
        });
    }


    /**
     * Legacy Hardcoded Layout (A6 default style)
     */
    private renderLegacyLayout(doc: PDFKit.PDFDocument, pageWidth: number, pageHeight: number, data: LabelData) {
        const margin = 20;
        let yPosition = margin;

        // 1. Logo (if provided)
        if (data.logoPath && fs.existsSync(data.logoPath)) {
            try {
                const logoHeight = 60;
                doc.image(data.logoPath, margin, yPosition, {
                    fit: [pageWidth - 2 * margin, logoHeight],
                    align: 'center'
                });
                yPosition += logoHeight + 20;
            } catch (error) {
                console.warn('Failed to load logo:', error);
            }
        }

        // 2. Sender (small, top-left)
        doc.fontSize(8);
        doc.text(`Absender: ${data.senderName}`, margin, yPosition);
        yPosition += 12;
        doc.text(`${data.senderStreet}, ${data.senderPostalCode} ${data.senderCity}`, margin, yPosition);
        yPosition += 30;

        // 3. Recipient (large, center)
        doc.fontSize(14);
        doc.font('Helvetica-Bold');
        doc.text(data.recipientName, margin, yPosition);
        yPosition += 20;

        doc.fontSize(12);
        doc.font('Helvetica');
        doc.text(data.recipientStreet, margin, yPosition);
        yPosition += 18;

        doc.fontSize(14);
        doc.font('Helvetica-Bold');
        doc.text(`${data.recipientPostalCode} ${data.recipientCity}`, margin, yPosition);
        yPosition += 25;

        if (data.recipientCountry && data.recipientCountry !== 'Deutschland') {
            doc.fontSize(12);
            doc.text(data.recipientCountry.toUpperCase(), margin, yPosition);
            yPosition += 20;
        }

        // 4. Tracking Number (Simple Text for now in legacy)
        doc.fontSize(10);
        doc.font('Helvetica');
        doc.text('Sendungsnummer: ' + data.trackingNumber, margin, pageHeight - margin - 20);
    }
}

export default new LabelGeneratorService();
