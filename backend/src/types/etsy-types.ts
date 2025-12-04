import { z } from 'zod';

// ==========================================
// Etsy CSV Types
// ==========================================

export interface EtsyOrderCSV {
    'Sale Date': string;
    'Order ID': string;
    'Buyer User ID': string;
    'Full Name': string;
    'First Name': string;
    'Last Name': string;
    'Number of Items': string;
    'Payment Method': string;
    'Date Shipped': string;
    'Street 1': string;
    'Street 2': string;
    'Ship City': string;
    'Ship State': string;
    'Ship Zipcode': string;
    'Ship Country': string;
    'Currency': string;
    'Order Value': string;
    'Coupon Code': string;
    'Coupon Details': string;
    'Discount Amount': string;
    'Shipping Discount': string;
    'Shipping': string;
    'Sales Tax': string;
    'Order Total': string;
    'Status': string;
    'Card Processing Fees': string;
    'Order Net': string;
    'Adjusted Order Total': string;
    'Adjusted Card Processing Fees': string;
    'Adjusted Net Order Amount': string;
    'Buyer': string;
    'Order Type': string;
    'Payment Type': string;
    'InPerson Discount': string;
    'InPerson Location': string;
    'VAT Paid by Buyer': string; // IOSS related
    'SKU': string; // Often empty in order level CSV, but present in order-item level if available
    'Listing ID': string;
    'Listing Title': string;
    'Variation Details': string;
    'Quantity': string;
    'Price': string;
    'Listing Variation ID': string;
}

export interface ImportResult {
    success: boolean;
    ordersCreated: number;
    ordersUpdated: number;
    errors: string[];
    fileName: string;
}

// ==========================================
// DHL API Types
// ==========================================

export const CreateLabelSchema = z.object({
    orderId: z.string().uuid(),
    productType: z.enum(['DHL_PAKET', 'DHL_KLEINPAKET', 'DEUTSCHE_POST_MAXIBRIEF']),
    weight: z.number().optional(), // in grams, overrides product weight
});

export type CreateLabelRequest = z.infer<typeof CreateLabelSchema>;

export interface DHLLabelResponse {
    shipmentNumber: string; // Tracking number
    labelUrl: string; // URL to PDF or base64
    labelData?: string; // Base64 encoded PDF
    routingCode?: string;
}
