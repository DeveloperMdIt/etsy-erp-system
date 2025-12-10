-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "gtin" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("createdAt", "description", "gtin", "id", "imageUrl", "materials", "name", "price", "sku", "stockQuantity", "tags", "tenantId", "updatedAt", "variationName1", "variationName2", "variationType1", "variationType2", "variationValue1", "variationValue2", "weight") SELECT "createdAt", "description", "gtin", "id", "imageUrl", "materials", "name", "price", "sku", "stockQuantity", "tags", "tenantId", "updatedAt", "variationName1", "variationName2", "variationType1", "variationType2", "variationValue1", "variationValue2", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_gtin_idx" ON "products"("gtin");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");
CREATE UNIQUE INDEX "products_tenantId_sku_key" ON "products"("tenantId", "sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
