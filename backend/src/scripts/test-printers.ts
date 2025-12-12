import { PrinterService } from '../services/printer.service';

async function test() {
    console.log('Testing Printer Service...');
    try {
        const printers = await PrinterService.getPrinters();
        console.log('Printers found:', printers);
        console.log('Total:', printers.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
