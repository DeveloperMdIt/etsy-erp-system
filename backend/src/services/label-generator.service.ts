import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Label Generator Service
 * 
 * Generates shipping labels in various sizes with:
 * - Company logo
 * - Sender address
 * - Recipient address
 * - Deutsche Post Internetmarke (QR code + tracking)
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

    // Label size
    sizePreset?: string;
    customWidth?: number;
    customHeight?: number;
}

export class LabelGeneratorService {
    /**
     * Generate label PDF
     */
    async generateLabelPDF(data: LabelData, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Determine label size
                let size: LabelSize;
                if (data.sizePreset && LABEL_SIZES[data.sizePreset]) {
                    size = LABEL_SIZES[data.sizePreset];
                } else if (data.customWidth && data.customHeight) {
                    size = { width: data.customWidth, height: data.customHeight };
                } else {
                    size = LABEL_SIZES.A5; // Default
                }

                const doc = new PDFDocument({
                    size: [mmToPoints(size.width), mmToPoints(size.height)],
                    margins: { top: 20, bottom: 20, left: 20, right: 20 }
                });

                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // Layout calculations
                const pageWidth = mmToPoints(size.width);
                const pageHeight = mmToPoints(size.height);
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

                // 4. Tracking Number + QR Code
                yPosition = pageHeight - margin - 100; // Position at bottom

                // Generate QR code for tracking
                QRCode.toDataURL(data.trackingNumber, { width: 80 }, (err, url) => {
                    if (!err && url) {
                        const qrSize = 80;
                        doc.image(url, pageWidth - margin - qrSize, yPosition, {
                            width: qrSize,
                            height: qrSize
                        });
                    }

                    // Tracking number text
                    doc.fontSize(10);
                    doc.font('Helvetica');
                    doc.text('Sendungsnummer:', margin, yPosition + 30);
                    doc.fontSize(12);
                    doc.font('Helvetica-Bold');
                    doc.text(data.trackingNumber, margin, yPosition + 45);

                    doc.end();
                });

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
     * Merge label PDF with Deutsche Post Internetmarke PDF
     */
    async mergePDFs(labelPath: string, internetmarkePath: string, outputPath: string): Promise<string> {
        // TODO: Implement PDF merging using pdf-lib or similar
        // For now, just return the label path
        return labelPath;
    }

    /**
     * Get label size in points
     */
    getLabelSize(preset?: string, customWidth?: number, customHeight?: number): { width: number; height: number } {
        if (preset && LABEL_SIZES[preset]) {
            const size = LABEL_SIZES[preset];
            return {
                width: mmToPoints(size.width),
                height: mmToPoints(size.height)
            };
        } else if (customWidth && customHeight) {
            return {
                width: mmToPoints(customWidth),
                height: mmToPoints(customHeight)
            };
        }

        // Default to A5
        return {
            width: mmToPoints(LABEL_SIZES.A5.width),
            height: mmToPoints(LABEL_SIZES.A5.height)
        };
    }
}

export default new LabelGeneratorService();
