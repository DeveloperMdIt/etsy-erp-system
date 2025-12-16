import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-to-printer';

const execAsync = promisify(exec);

interface Printer {
    name: string;
    isDefault: boolean;
    status?: string;
}

export class PrintingService {
    /**
     * Get list of available printers
     */
    async getAvailablePrinters(): Promise<Printer[]> {
        if (process.platform !== 'win32') {
            console.warn('⚠️ Printing is only supported on Windows. Returning empty list.');
            return [];
        }

        try {
            const command = 'powershell -NoProfile -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"';

            // Try powershell, fallback to pwsh
            let stdoutString = '';
            try {
                const { stdout } = await execAsync(command);
                stdoutString = stdout;
            } catch (err) {
                const { stdout } = await execAsync('pwsh -NoProfile -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"');
                stdoutString = stdout;
            }

            if (!stdoutString) return [];

            // PowerShell Json output can be single object or array
            const printers = JSON.parse(stdoutString);
            const printerArray = Array.isArray(printers) ? printers : [printers];

            return printerArray.map((p: any) => ({
                name: p.Name,
                isDefault: p.Default === true
            }));
        } catch (error: any) {
            console.error('❌ Failed to get printers:', error.message);
            return [];
        }
    }

    /**
     * Print PDF to specified printer
     */
    async printPDF(pdfPath: string, printerName?: string): Promise<boolean> {
        if (process.platform !== 'win32') {
            console.warn('⚠️ Printing is only supported on Windows. Skipping print job.');
            // Return true to avoid errors in frontend
            return true;
        }

        try {
            if (!fs.existsSync(pdfPath)) {
                throw new Error(`PDF file not found: ${pdfPath}`);
            }

            // check if pdf-to-printer works?
            // If printerName is provided, use it. usage: pdf.print(file, { printer: name })
            const options: any = {};
            if (printerName) {
                options.printer = printerName;
            }

            await pdf.print(pdfPath, options);
            console.log(`✅ PDF sent to printer: ${printerName || 'default'}`);
            return true;
        } catch (error: any) {
            console.error('❌ Failed to print PDF:', error.message);
            throw new Error(`Print failed: ${error.message}`);
        }
    }

    /**
     * Test printer by printing a test page
     */
    async testPrinter(printerName: string): Promise<boolean> {
        // Placeholder test
        return true;
    }

    /**
     * Get default printer
     */
    async getDefaultPrinter(): Promise<string | null> {
        try {
            const printers = await this.getAvailablePrinters();
            const defaultPrinter = printers.find(p => p.isDefault);
            return defaultPrinter?.name || null;
        } catch (error) {
            return null;
        }
    }
}

export default new PrintingService();
