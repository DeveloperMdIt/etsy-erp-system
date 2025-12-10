-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_variations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "childProductId" TEXT,
    "sku" TEXT NOT NULL,
    "price" REAL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "name1" TEXT,
    "value1" TEXT,
    "name2" TEXT,
    "value2" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_variations_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product_variations" ("createdAt", "id", "name1", "name2", "price", "productId", "sku", "stockQuantity", "updatedAt", "value1", "value2") SELECT "createdAt", "id", "name1", "name2", "price", "productId", "sku", "stockQuantity", "updatedAt", "value1", "value2" FROM "product_variations";
DROP TABLE "product_variations";
ALTER TABLE "new_product_variations" RENAME TO "product_variations";
CREATE INDEX "product_variations_sku_idx" ON "product_variations"("sku");
CREATE INDEX "product_variations_childProductId_idx" ON "product_variations"("childProductId");
CREATE UNIQUE INDEX "product_variations_productId_sku_key" ON "product_variations"("productId", "sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
