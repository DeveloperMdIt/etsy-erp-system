import pdf from 'pdf-to-printer';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export class PrinterService {

    /**
     * Get list of available printers on the system using PowerShell
     */
    static async getPrinters(): Promise<string[]> {
        try {
            // Try 'powershell' first (Windows PowerShell), then 'pwsh' (Core)
            const command = 'powershell -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name"';

            const { stdout } = await execAsync(command).catch(async (err) => {
                // Fallback to pwsh if powershell fails
                return await execAsync('pwsh -NoProfile -Command "Get-Printer | Select-Object -ExpandProperty Name"');
            });

            if (!stdout) return [];

            return stdout.trim().split(/\r?\n/).map(p => p.trim()).filter(p => p);
        } catch (error) {
            console.error('Failed to list printers via PowerShell:', error);
            return [];
        }
    }

    /**
     * Print a PDF file to a specific printer
     */
    static async printFile(filePath: string, printerName: string, format: string = 'A4'): Promise<boolean> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        try {
            await pdf.print(filePath, {
                printer: printerName
            });
            console.log(`Printed ${filePath} to ${printerName}`);
            return true;
        } catch (error) {
            console.error(`Failed to print to ${printerName}:`, error);
            throw error;
        }
    }
}
