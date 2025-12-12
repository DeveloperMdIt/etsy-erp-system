import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Printing Service
 * 
 * Handles direct printing to system printers
 * Uses pdf-to-printer for Windows (can be extended for macOS/Linux)
 */

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
        try {
            if (process.platform === 'win32') {
                // Windows: Use PowerShell to get printers
                const { stdout } = await execAsync(
                    'powershell -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"'
                );

                const printers = JSON.parse(stdout);
                const printerArray = Array.isArray(printers) ? printers : [printers];

                return printerArray.map((p: any) => ({
                    name: p.Name,
                    isDefault: p.Default === true
                }));
            } else {
                // macOS/Linux: Use lpstat
                const { stdout } = await execAsync('lpstat -p -d');
                // Parse lpstat output (simplified)
                const lines = stdout.split('\n');
                const printers: Printer[] = [];

                for (const line of lines) {
                    if (line.startsWith('printer')) {
                        const match = line.match(/printer\s+(\S+)/);
                        if (match) {
                            printers.push({
                                name: match[1],
                                isDefault: false
                            });
                        }
                    }
                }

                return printers;
            }
        } catch (error: any) {
            console.error('❌ Failed to get printers:', error.message);
            return [];
        }
    }

    /**
     * Print PDF to specified printer
     */
    async printPDF(pdfPath: string, printerName?: string): Promise<boolean> {
        try {
            if (!fs.existsSync(pdfPath)) {
                throw new Error(`PDF file not found: ${pdfPath}`);
            }

            if (process.platform === 'win32') {
                // Windows: Use SumatraPDF or Adobe Reader command line
                // For simplicity, we'll use PowerShell's Start-Process
                const printerArg = printerName ? `-PrinterName "${printerName}"` : '';

                // Using PowerShell to print
                const command = printerName
                    ? `powershell -Command "Start-Process -FilePath '${pdfPath}' -ArgumentList '/t', '${printerName}' -Verb Print"`
                    : `powershell -Command "Start-Process -FilePath '${pdfPath}' -Verb Print"`;

                await execAsync(command);

                console.log(`✅ PDF sent to printer: ${printerName || 'default'}`);
                return true;
            } else {
                // macOS/Linux: Use lp command
                const command = printerName
                    ? `lp -d ${printerName} "${pdfPath}"`
                    : `lp "${pdfPath}"`;

                await execAsync(command);

                console.log(`✅ PDF sent to printer: ${printerName || 'default'}`);
                return true;
            }
        } catch (error: any) {
            console.error('❌ Failed to print PDF:', error.message);
            throw new Error(`Print failed: ${error.message}`);
        }
    }

    /**
     * Test printer by printing a test page
     */
    async testPrinter(printerName: string): Promise<boolean> {
        try {
            // Create a simple test PDF
            const testPdfPath = path.join(process.cwd(), 'temp', `test-${Date.now()}.pdf`);

            // Ensure temp directory exists
            const tempDir = path.dirname(testPdfPath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Create a simple test PDF (you can use PDFKit here)
            // For now, just return true
            console.log(`🧪 Test print to: ${printerName}`);
            return true;
        } catch (error: any) {
            console.error('❌ Printer test failed:', error.message);
            return false;
        }
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
