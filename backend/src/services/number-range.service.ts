import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type NumberRangeType = 'ORDER' | 'INVOICE' | 'DELIVERY' | 'SUPPLIER' | 'CUSTOMER';

export class NumberRangeService {
    /**
     * Generate next number based on format and increment counter
     */
    /**
     * Generate next number based on format and increment counter
     */
    async generateNumber(type: NumberRangeType, userId: string, date: Date = new Date()): Promise<string> {
        return await prisma.$transaction(async (tx) => {
            const settings = await tx.userSettings.findUnique({
                where: { userId },
            });

            if (!settings) {
                throw new Error('User settings not found');
            }

            // Get format and current counter based on type
            let format: string;
            let current: number;
            let fieldToUpdate: keyof typeof settings;

            switch (type) {
                case 'ORDER':
                    format = settings.orderNumberFormat;
                    current = settings.orderNumberCurrent;
                    fieldToUpdate = 'orderNumberCurrent';
                    break;
                case 'INVOICE':
                    format = settings.invoiceNumberFormat;
                    current = settings.invoiceNumberCurrent;
                    fieldToUpdate = 'invoiceNumberCurrent';
                    break;
                case 'DELIVERY':
                    format = settings.deliveryNoteFormat;
                    current = settings.deliveryNoteCurrent;
                    fieldToUpdate = 'deliveryNoteCurrent';
                    break;
                case 'SUPPLIER':
                    format = settings.supplierOrderFormat;
                    current = settings.supplierOrderCurrent;
                    fieldToUpdate = 'supplierOrderCurrent';
                    break;
                case 'CUSTOMER':
                    format = settings.customerNumberFormat;
                    current = settings.customerNumberCurrent;
                    fieldToUpdate = 'customerNumberCurrent';
                    break;
                default:
                    throw new Error(`Unknown number type: ${type}`);
            }

            // Generate the number using the CURRENT value (before increment)
            // Valid pattern: Use 1, then increment to 2 for next time.
            const number = this.parseFormat(format, current, date);
            console.log(`Generated ${type} number: ${number} (Counter: ${current})`);

            // Increment the counter atomically
            await tx.userSettings.update({
                where: { userId },
                data: {
                    [fieldToUpdate]: { increment: 1 }
                }
            });

            return number;
        });
    }

    /**
     * Parse format string and replace placeholders
     * Format: "BO-{YYYY}-{####}"
     * Placeholders:
     * - {YYYY} = Year (4 digits)
     * - {YY} = Year (2 digits)
     * - {MM} = Month (2 digits)
     * - {DD} = Day (2 digits)
     * - {####} = Counter (number of # = digits, zero-padded)
     */
    parseFormat(format: string, counter: number, date: Date = new Date()): string {
        const now = date;

        let result = format;

        // Helper to replace both {TOKEN} and TOKEN
        const replaceToken = (token: string, value: string) => {
            // Replace {TOKEN}
            result = result.replace(`{${token}}`, value);
            // Replace TOKEN (only if not surrounded by other letters/numbers ideally, but for now simple global replace is fine for this specific domain)
            // safer: match TOKEN but strict check if it was intended? 
            // Simple approach: just replace.
            result = result.replace(token, value);
        };

        // Replace date placeholders
        replaceToken('YYYY', now.getFullYear().toString());
        replaceToken('YY', now.getFullYear().toString().slice(-2));
        replaceToken('MM', (now.getMonth() + 1).toString().padStart(2, '0'));
        replaceToken('DD', now.getDate().toString().padStart(2, '0'));

        // Replace counter placeholder
        // Try {####} style first
        let counterMatch = result.match(/\{(#+)\}/);

        // If not found, try simple ##### style
        if (!counterMatch) {
            counterMatch = result.match(/(#+)/);
        }

        if (counterMatch) {
            const digits = counterMatch[1].length;
            const paddedCounter = counter.toString().padStart(digits, '0');
            // If we matched with braces, replace the whole group 0 (including braces)
            // If we matched with regex capture 1, replace match 0 (which is same)
            result = result.replace(counterMatch[0], paddedCounter);
        }

        return result;
    }

    /**
     * Preview what the next number will look like without incrementing
     */
    async previewNumber(type: NumberRangeType, userId: string): Promise<string> {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            throw new Error('User settings not found');
        }

        let format: string;
        let current: number;

        switch (type) {
            case 'ORDER':
                format = settings.orderNumberFormat;
                current = settings.orderNumberCurrent;
                break;
            case 'INVOICE':
                format = settings.invoiceNumberFormat;
                current = settings.invoiceNumberCurrent;
                break;
            case 'DELIVERY':
                format = settings.deliveryNoteFormat;
                current = settings.deliveryNoteCurrent;
                break;
            case 'SUPPLIER':
                format = settings.supplierOrderFormat;
                current = settings.supplierOrderCurrent;
                break;
            case 'CUSTOMER':
                format = settings.customerNumberFormat;
                current = settings.customerNumberCurrent;
                break;
        }

        return this.parseFormat(format, current);
    }
}

export default new NumberRangeService();
