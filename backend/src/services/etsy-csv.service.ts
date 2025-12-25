import fs from 'fs';
import { parse } from 'csv-parse';
import prisma from '../utils/prisma';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';

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
                // Use findFirst instead of findUnique because etsyReceiptId might not be marked @unique in schema yet
                const existingOrder = await prisma.order.findFirst({
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
                    const hasValidAddress = customer.street && customer.city && customer.postalCode;

                    if (!hasValidAddress) {
                        // Split name if needed (Customer model likely has firstName/lastName)
                        let newFirstName = customer.firstName;
                        let newLastName = customer.lastName;

                        if (row['Ship Name']) {
                            const parts = row['Ship Name'].split(' ');
                            if (parts.length > 0) newFirstName = parts[0];
                            if (parts.length > 1) newLastName = parts.slice(1).join(' ');
                            else newLastName = '';
                        }

                        // PATCH IT!
                        await prisma.customer.update({
                            where: { id: customer.id },
                            data: {
                                firstName: newFirstName,
                                lastName: newLastName,
                                street: row['Ship Address1'],
                                addressAddition: row['Ship Address2'],
                                city: row['Ship City'],
                                // state: row['Ship State'], // Might not exist on Customer model? safe to omit if unsure
                                postalCode: row['Ship Zipcode'],
                                country: row['Ship Country'],
                            }
                        });
                        patchedCount++;
                    }
                }
            }

            await ActivityLogService.log(LogType.INFO, LogAction.ETSY_SYNC as any, `CSV Import completed. Patched ${patchedCount} orders.`);

            return {
                success: true,
                patchedCount,
                message: `Import erfolgreich. ${patchedCount} Adressen wurden ergänzt.`,
            };

        } catch (error) {
            console.error('[EtsyCSV] Error processing CSV:', error);
            await ActivityLogService.log(LogType.ERROR, LogAction.ETSY_SYNC as any, 'CSV Import failed', undefined, undefined, { error: String(error) });
            throw new Error('Fehler beim Verarbeiten der CSV-Datei.');
        } finally {
            // Cleanup: Delete the temp file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}
