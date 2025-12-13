/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,documentNumber]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerNumber` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "documents_documentNumber_key";

-- CreateTable
CREATE TABLE "label_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "printerName" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "layoutJson" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "label_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "tenantId" TEXT,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "billingNumber" TEXT,
    "printerName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "shipping_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "addressAddition" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'DE',
    "phone" TEXT,
    "isRepeatCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_customers" ("addressAddition", "city", "country", "createdAt", "email", "firstName", "id", "isRepeatCustomer", "lastName", "phone", "postalCode", "street", "tenantId", "updatedAt") SELECT "addressAddition", "city", "country", "createdAt", "email", "firstName", "id", "isRepeatCustomer", "lastName", "phone", "postalCode", "street", "tenantId", "updatedAt" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE UNIQUE INDEX "customers_tenantId_email_key" ON "customers"("tenantId", "email");
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "externalOrderId" TEXT,
    "platform" TEXT,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "shippingCost" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "shippingProvider" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" DATETIME,
    "notes" TEXT,
    "isSyncedToEtsy" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerId", "externalOrderId", "id", "notes", "orderNumber", "platform", "shippedAt", "shippingCost", "shippingProvider", "status", "tenantId", "totalPrice", "trackingNumber", "updatedAt") SELECT "createdAt", "customerId", "externalOrderId", "id", "notes", "orderNumber", "platform", "shippedAt", "shippingCost", "shippingProvider", "status", "tenantId", "totalPrice", "trackingNumber", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE INDEX "orders_tenantId_idx" ON "orders"("tenantId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_externalOrderId_idx" ON "orders"("externalOrderId");
CREATE INDEX "orders_isSyncedToEtsy_idx" ON "orders"("isSyncedToEtsy");
CREATE UNIQUE INDEX "orders_tenantId_orderNumber_key" ON "orders"("tenantId", "orderNumber");
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "etsyListingId" TEXT,
    "sku" TEXT NOT NULL,
    "gtin" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SIMPLE',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
    "images" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "materials" TEXT,
    "variationType1" TEXT,
    "variationName1" TEXT,
    "variationValue1" TEXT,
    "variationType2" TEXT,
    "variationName2" TEXT,
    "variationValue2" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showInShop" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("createdAt", "description", "gtin", "id", "imageUrl", "images", "isActive", "materials", "name", "price", "showInShop", "sku", "stockQuantity", "tags", "tenantId", "type", "updatedAt", "variationName1", "variationName2", "variationType1", "variationType2", "variationValue1", "variationValue2", "weight") SELECT "createdAt", "description", "gtin", "id", "imageUrl", "images", "isActive", "materials", "name", "price", "showInShop", "sku", "stockQuantity", "tags", "tenantId", "type", "updatedAt", "variationName1", "variationName2", "variationType1", "variationType2", "variationValue1", "variationValue2", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE INDEX "products_userId_idx" ON "products"("userId");
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_etsyListingId_idx" ON "products"("etsyListingId");
CREATE INDEX "products_gtin_idx" ON "products"("gtin");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE UNIQUE INDEX "products_userId_sku_key" ON "products"("userId", "sku");
CREATE TABLE "new_user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "etsyShopName" TEXT,
    "etsySyncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dhlApiUsername" TEXT,
    "dhlApiPassword" TEXT,
    "dhlGkpUsername" TEXT,
    "dhlGkpPassword" TEXT,
    "dhlEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dhlAppId" TEXT,
    "dhlAppSecret" TEXT,
    "dhlEkp" TEXT,
    "dhlProcedure" TEXT DEFAULT '01',
    "dhlParticipation" TEXT,
    "dhlBillingNrPaket" TEXT,
    "dhlBillingNrKleinpaket" TEXT,
    "dhlBillingNrWarenpost" TEXT,
    "dhlDefaultPrinterFormat" TEXT DEFAULT '910-300-410',
    "deutschePostUsername" TEXT,
    "deutschePostPassword" TEXT,
    "deutschePostClientId" TEXT,
    "deutschePostClientSecret" TEXT,
    "deutschePostWalletBalance" REAL DEFAULT 0,
    "deutschePostEnabled" BOOLEAN NOT NULL DEFAULT false,
    "printerInvoice" TEXT,
    "formatInvoice" TEXT DEFAULT 'A4',
    "printerDeliveryNote" TEXT,
    "formatDeliveryNote" TEXT DEFAULT 'A4',
    "printerLabel" TEXT,
    "formatLabel" TEXT DEFAULT 'A6',
    "labelLogoPath" TEXT,
    "labelCompanyName" TEXT,
    "labelStreet" TEXT,
    "labelPostalCode" TEXT,
    "labelCity" TEXT,
    "labelCountry" TEXT DEFAULT 'Deutschland',
    "labelPhone" TEXT,
    "labelEmail" TEXT,
    "labelSizePreset" TEXT DEFAULT 'A5',
    "labelCustomWidth" INTEGER,
    "labelCustomHeight" INTEGER,
    "defaultPrinter" TEXT,
    "autoPrintEnabled" BOOLEAN NOT NULL DEFAULT true,
    "printerDeutschePost" TEXT,
    "printerDHL" TEXT,
    "printerDPD" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFrom" TEXT,
    "orderNumberFormat" TEXT NOT NULL DEFAULT 'BE-{YYYY}-{####}',
    "orderNumberStart" INTEGER NOT NULL DEFAULT 1,
    "orderNumberCurrent" INTEGER NOT NULL DEFAULT 1,
    "invoiceNumberFormat" TEXT NOT NULL DEFAULT 'RE-{YYYY}-{####}',
    "invoiceNumberStart" INTEGER NOT NULL DEFAULT 1,
    "invoiceNumberCurrent" INTEGER NOT NULL DEFAULT 1,
    "deliveryNoteFormat" TEXT NOT NULL DEFAULT 'LS-{YYYY}-{####}',
    "deliveryNoteStart" INTEGER NOT NULL DEFAULT 1,
    "deliveryNoteCurrent" INTEGER NOT NULL DEFAULT 1,
    "supplierOrderFormat" TEXT NOT NULL DEFAULT 'LB-{YYYY}-{####}',
    "supplierOrderStart" INTEGER NOT NULL DEFAULT 1,
    "supplierOrderCurrent" INTEGER NOT NULL DEFAULT 1,
    "customerNumberFormat" TEXT NOT NULL DEFAULT 'KD-{YYYY}-{####}',
    "customerNumberStart" INTEGER NOT NULL DEFAULT 1,
    "customerNumberCurrent" INTEGER NOT NULL DEFAULT 1,
    "nextProductId" INTEGER NOT NULL DEFAULT 1,
    "skuPrefix" TEXT NOT NULL DEFAULT '10',
    "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "setupCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_settings" ("createdAt", "deliveryNoteCurrent", "deliveryNoteFormat", "deliveryNoteStart", "dhlApiPassword", "dhlApiUsername", "etsyShopName", "id", "invoiceNumberCurrent", "invoiceNumberFormat", "invoiceNumberStart", "nextProductId", "orderNumberCurrent", "orderNumberFormat", "orderNumberStart", "setupCompleted", "setupCompletedAt", "skuPrefix", "smtpFrom", "smtpHost", "smtpPassword", "smtpPort", "smtpUsername", "supplierOrderCurrent", "supplierOrderFormat", "supplierOrderStart", "updatedAt", "userId") SELECT "createdAt", "deliveryNoteCurrent", "deliveryNoteFormat", "deliveryNoteStart", "dhlApiPassword", "dhlApiUsername", "etsyShopName", "id", "invoiceNumberCurrent", "invoiceNumberFormat", "invoiceNumberStart", "nextProductId", "orderNumberCurrent", "orderNumberFormat", "orderNumberStart", "setupCompleted", "setupCompletedAt", "skuPrefix", "smtpFrom", "smtpHost", "smtpPassword", "smtpPort", "smtpUsername", "supplierOrderCurrent", "supplierOrderFormat", "supplierOrderStart", "updatedAt", "userId" FROM "user_settings";
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "label_profiles_userId_idx" ON "label_profiles"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "shipping_methods_tenantId_idx" ON "shipping_methods"("tenantId");

-- CreateIndex
CREATE INDEX "shipping_methods_userId_idx" ON "shipping_methods"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenantId_documentNumber_key" ON "documents"("tenantId", "documentNumber");
