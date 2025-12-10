/*
  Warnings:

  - You are about to drop the column `etsyOrderNumber` on the `orders` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerId", "id", "notes", "orderNumber", "shippedAt", "shippingCost", "shippingProvider", "status", "tenantId", "totalPrice", "trackingNumber", "updatedAt") SELECT "createdAt", "customerId", "id", "notes", "orderNumber", "shippedAt", "shippingCost", "shippingProvider", "status", "tenantId", "totalPrice", "trackingNumber", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE INDEX "orders_tenantId_idx" ON "orders"("tenantId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_externalOrderId_idx" ON "orders"("externalOrderId");
CREATE TABLE "new_user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "etsyShopName" TEXT,
    "dhlApiUsername" TEXT,
    "dhlApiPassword" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "smtpFrom" TEXT,
    "orderNumberFormat" TEXT NOT NULL DEFAULT 'BO-{YYYY}-{####}',
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
    "nextProductId" INTEGER NOT NULL DEFAULT 1,
    "skuPrefix" TEXT NOT NULL DEFAULT '10',
    "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "setupCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_settings" ("createdAt", "dhlApiPassword", "dhlApiUsername", "etsyShopName", "id", "smtpFrom", "smtpHost", "smtpPassword", "smtpPort", "smtpUsername", "updatedAt", "userId") SELECT "createdAt", "dhlApiPassword", "dhlApiUsername", "etsyShopName", "id", "smtpFrom", "smtpHost", "smtpPassword", "smtpPort", "smtpUsername", "updatedAt", "userId" FROM "user_settings";
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
