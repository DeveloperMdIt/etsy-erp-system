
import csv from 'csv-parser';
import { Readable } from 'stream';

const csvContent = `Sale Date,"Item Name",Buyer,Quantity,Price,"Coupon Code","Coupon Details","Discount Amount","Shipping Discount","Order Shipping","Order Sales Tax","Item Total",Currency,"Transaction ID","Listing ID","Date Paid","Date Shipped","Ship Name","Ship Address1","Ship Address2","Ship City","Ship State","Ship Zipcode","Ship Country","Order ID",Variations,"Order Type","Listings Type","Payment Type","InPerson Discount","InPerson Location","VAT Paid by Buyer",SKU
11/11/2024,"Item A",Buyer Name,1,10.00,Coupon,Details,0,0,5.00,0,15.00,EUR,Trans123,List123,11/11/2024,11/12/2024,Ship Name,Street 1,,City,State,12345,DE,123456789,,Online,Listing,Payment,0,,0,SKU123`;

console.log('Testing CSV Parser...');

const stream = Readable.from([csvContent]);

stream
    .pipe(csv())
    .on('data', (row) => {
        console.log('Row keys:', Object.keys(row));
        console.log('Order ID:', row['Order ID']);
        console.log('Full Row:', row);
    })
    .on('end', () => {
        console.log('Done.');
    });
