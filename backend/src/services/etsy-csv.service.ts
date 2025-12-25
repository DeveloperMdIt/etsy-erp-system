
import fs from 'fs';
import { parse } from 'csv-parse';
import { prisma } from '../prisma';
import { ActivityLogService } from './activity-log.service';

interface EtsyCsvRow {
    'Order ID': string;
    'Ship Name': string;
    'Ship Address1': string;
    'Ship Address2': string;
    'Ship City': string;
    'Ship State': string;
    'Ship Zipcode': string;
    'Ship Country': string;
    [key: string]: string;
}

export class EtsyCsvService {
    static async processCsvUpload(filePath: string): Promise<{ success: boolean; patchedCount: number; message: string }> {
        const rows: EtsyCsvRow[] = [];
        let patchedCount = 0;

        try {
            // 1. Parse CSV
            const parser = fs.createReadStream(filePath).pipe(
                parse({
                    columns: true,
                    skip_empty_lines: true,
                    trim: true,
                })
            );

            for await (const row of parser) {
                rows.push(row as EtsyCsvRow);
            }

            console.log(`[EtsyCSV] Parsed ${rows.length} rows.`);

            // 2. Process each row
            for (const row of rows) {
                const etsyOrderId = row['Order ID']; // Used as receipt_id

                if (!etsyOrderId) continue;

                // Check if order exists in our DB
                const existingOrder = await prisma.order.findUnique({
                    where: { etsyReceiptId: etsyOrderId },
                    include: { customer: true },
                });

                if (!existingOrder) {
                    // Order not found (maybe not synced yet), skip
                    continue;
                }

                // Check if customer exists and if address is already "good"
                const customer = existingOrder.customer;

                if (customer) {
                    // Logic: Only patch if address is missing or clearly incomplete
                    // Note: We might want to allow forcing update, but user wants "patch missing".
                    // Let's check if we have a valid address.
                    const hasValidAddress = customer.address && customer.city && customer.zip;

                    if (!hasValidAddress) {
                        // PATCH IT!
                        await prisma.customer.update({
                            where: { id: customer.id },
                            data: {
                                name: row['Ship Name'] || customer.name || 'Unknown', // Fallback to existing or file
                                address: row['Ship Address1'],
                                address2: row['Ship Address2'],
                                city: row['Ship City'],
                                state: row['Ship State'],
                                zip: row['Ship Zipcode'],
                                country: row['Ship Country'],
                            }
                        });
                        patchedCount++;
                    }
                }
            }

            await ActivityLogService.log('INFO', `CSV Import completed. Patched ${patchedCount} orders.`);

            return {
                success: true,
                patchedCount,
                message: `Import erfolgreich. ${patchedCount} Adressen wurden ergänzt.`,
            };

        } catch (error) {
            console.error('[EtsyCSV] Error processing CSV:', error);
            await ActivityLogService.log('ERROR', 'CSV Import failed', { error: String(error) });
            throw new Error('Fehler beim Verarbeiten der CSV-Datei.');
        } finally {
            // Cleanup: Delete the temp file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}
