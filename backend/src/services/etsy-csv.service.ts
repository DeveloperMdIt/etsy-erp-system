import fs from 'fs';
import { parse } from 'csv-parse';
import prisma from '../utils/prisma';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';

interface EtsyCsvRow {
    'Order ID': string;
    'Full Name': string;
    'First Name': string;
    'Last Name': string;
    'Street 1': string;
    'Street 2': string;
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
                    bom: true, // Handle Excel BOM
                    relax_quotes: true,
                })
            );

            for await (const row of parser) {
                rows.push(row as EtsyCsvRow);
            }

            console.log(`[EtsyCSV] Parsed ${rows.length} rows.`);

            // 2. Process each row
            for (const row of rows) {
                const etsyOrderId = row['Order ID'];

                if (!etsyOrderId) continue;

                // Check if order exists in our DB
                const existingOrder = await prisma.order.findFirst({
                    where: { externalOrderId: etsyOrderId },
                    include: { customer: true },
                });

                if (!existingOrder) {
                    // Order not found (maybe not synced yet), skip
                    continue;
                }

                // Check if customer exists
                const customer = (existingOrder as any).customer;

                if (customer) {
                    // Force update if address is missing OR if we want to overwrite 'Unknown' placeholders
                    // Checking for minimal validity: Street + City + Zip
                    const hasValidAddress = customer.street && customer.street !== 'Unknown' &&
                        customer.city && customer.city !== 'Unknown' &&
                        customer.postalCode && customer.postalCode !== 'Unknown';

                    if (!hasValidAddress || true) { // We might want to allow overwriting always with CSV data if it exists
                        // Better logic: If CSV has address, use it.
                        if (!row['Street 1']) continue; // No address in CSV either

                        let newFirstName = row['First Name'] || customer.firstName;
                        let newLastName = row['Last Name'] || customer.lastName;

                        // Fallback to Full Name split if First/Last empty in CSV
                        if (!newFirstName && !newLastName && row['Full Name']) {
                            const parts = row['Full Name'].split(' ');
                            if (parts.length > 0) newFirstName = parts[0];
                            if (parts.length > 1) newLastName = parts.slice(1).join(' ');
                        }

                        // PATCH IT!
                        await prisma.customer.update({
                            where: { id: customer.id },
                            data: {
                                firstName: newFirstName,
                                lastName: newLastName,
                                street: row['Street 1'],
                                addressAddition: row['Street 2'],
                                city: row['Ship City'],
                                // state: row['Ship State'], 
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
