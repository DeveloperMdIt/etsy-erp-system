
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userId = '61c629cc-23ad-44ec-89aa-041039eb1880'; // From user log

async function main() {
    console.log(`Testing Settings Update for User ${userId}...`);

    const payload = {
        "dhlEnabled": true,
        "dhlGkpUsername": "inventivy-packtisch",
        "dhlGkpPassword": "Euramobil161090!",
        "dhlEkp": "6339014020",
        "dhlProcedure": "01",
        "dhlParticipation": "01",
        "dhlBillingNrPaket": "",
        "dhlBillingNrKleinpaket": "",
        "firstName": "Michael",
        "lastName": "Deja",
        "shopName": "DekoWeltenDE",
        "labelProfiles": [],
        "labelLogoPath": "",
        "labelCompanyName": "",
        "labelStreet": "",
        "labelPostalCode": "",
        "labelCity": "",
        "labelCountry": "Deutschland",
        "labelPhone": "",
        "orderNumberFormat": "BE-{YYYY}-{####}",
        "orderNumberCurrent": 1,
        "invoiceNumberFormat": "RE-{YYYY}-{####}",
        "invoiceNumberCurrent": 1,
        "deliveryNoteFormat": "LS-{YYYY}-{####}",
        "deliveryNoteCurrent": 1,
        "supplierOrderFormat": "LB-{YYYY}-{####}",
        "supplierOrderCurrent": 1,
        "customerNumberFormat": "KD-{YYYY}-{####}",
        "customerNumberCurrent": 1,
        "skuPrefix": "10",
        "nextProductId": 1,
        "printerInvoice": "",
        "formatInvoice": "A4",
        "printerDeliveryNote": "",
        "formatDeliveryNote": "A4"
    };

    try {
        await prisma.$transaction(async (tx) => {
            // Mocking the behavior in settings.routes.ts
            // 2. Update Settings
            await tx.userSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    dhlGkpUsername: payload.dhlGkpUsername,
                    dhlGkpPassword: payload.dhlGkpPassword,
                    dhlEnabled: payload.dhlEnabled,
                    dhlEkp: payload.dhlEkp,
                    dhlProcedure: payload.dhlProcedure,
                    dhlParticipation: payload.dhlParticipation,
                    dhlBillingNrPaket: payload.dhlBillingNrPaket,
                    dhlBillingNrKleinpaket: payload.dhlBillingNrKleinpaket,

                    // deutschePost... (skipped in payload, so undefined/null in route destructuring)

                    printerInvoice: payload.printerInvoice,
                    formatInvoice: payload.formatInvoice,
                    printerDeliveryNote: payload.printerDeliveryNote,
                    formatDeliveryNote: payload.formatDeliveryNote,

                    // Defaults that were in route but might be undefined in payload
                    // printerLabel, formatLabel, defaultPrinter, autoPrintEnabled

                    // In route: labelLogoPath, etc.
                    labelLogoPath: payload.labelLogoPath,
                    labelCompanyName: payload.labelCompanyName,
                    labelStreet: payload.labelStreet,
                    labelPostalCode: payload.labelPostalCode,
                    labelCity: payload.labelCity,
                    labelCountry: payload.labelCountry,
                    labelPhone: payload.labelPhone,

                    orderNumberFormat: payload.orderNumberFormat,
                    invoiceNumberFormat: payload.invoiceNumberFormat,
                    deliveryNoteFormat: payload.deliveryNoteFormat,
                    supplierOrderFormat: payload.supplierOrderFormat,
                    customerNumberFormat: payload.customerNumberFormat,
                    skuPrefix: payload.skuPrefix,

                    orderNumberCurrent: payload.orderNumberCurrent,
                    invoiceNumberCurrent: payload.invoiceNumberCurrent,
                    deliveryNoteCurrent: payload.deliveryNoteCurrent,
                    supplierOrderCurrent: payload.supplierOrderCurrent,
                    customerNumberCurrent: payload.customerNumberCurrent,
                    nextProductId: payload.nextProductId
                },
                update: {
                    dhlGkpUsername: payload.dhlGkpUsername,
                    dhlGkpPassword: payload.dhlGkpPassword,
                    dhlEnabled: payload.dhlEnabled,
                    dhlEkp: payload.dhlEkp,
                    dhlProcedure: payload.dhlProcedure,
                    dhlParticipation: payload.dhlParticipation,
                    dhlBillingNrPaket: payload.dhlBillingNrPaket,
                    dhlBillingNrKleinpaket: payload.dhlBillingNrKleinpaket,

                    printerInvoice: payload.printerInvoice,
                    formatInvoice: payload.formatInvoice,
                    printerDeliveryNote: payload.printerDeliveryNote,
                    formatDeliveryNote: payload.formatDeliveryNote,

                    labelLogoPath: payload.labelLogoPath,
                    labelCompanyName: payload.labelCompanyName,
                    labelStreet: payload.labelStreet,
                    labelPostalCode: payload.labelPostalCode,
                    labelCity: payload.labelCity,
                    labelCountry: payload.labelCountry,
                    labelPhone: payload.labelPhone,

                    orderNumberFormat: payload.orderNumberFormat,
                    invoiceNumberFormat: payload.invoiceNumberFormat,
                    deliveryNoteFormat: payload.deliveryNoteFormat,
                    supplierOrderFormat: payload.supplierOrderFormat,
                    customerNumberFormat: payload.customerNumberFormat,
                    skuPrefix: payload.skuPrefix,

                    orderNumberCurrent: payload.orderNumberCurrent,
                    invoiceNumberCurrent: payload.invoiceNumberCurrent,
                    deliveryNoteCurrent: payload.deliveryNoteCurrent,
                    supplierOrderCurrent: payload.supplierOrderCurrent,
                    customerNumberCurrent: payload.customerNumberCurrent,
                    nextProductId: payload.nextProductId
                }
            });
            console.log("Upsert successful!");
        });
    } catch (e) {
        console.error("Upsert Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
