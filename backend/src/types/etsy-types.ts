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
    'SKU': string;
    'Listing ID': string;
    'Listing Title': string;
    'Item Name': string; // Alternative to Listing Title
    'Variation Details': string;
    'Ship Address 1': string;
    'Ship Address 2': string;
    'Ship Address1': string; // Alternative from user CSV
    'Ship Address2': string; // Alternative from user CSV
    'Ship Name': string;
    'Order Shipping': string; // Alternative to Shipping
    'Zip': string; // Alternative to Ship Zipcode
    'City': string; // Alternative to Ship City
    'Country': string; // Alternative to Ship Country
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
