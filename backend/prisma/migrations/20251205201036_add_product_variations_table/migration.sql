-- CreateTable
CREATE TABLE "product_variations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" REAL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "name1" TEXT,
    "value1" TEXT,
    "name2" TEXT,
    "value2" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "product_variations_sku_idx" ON "product_variations"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variations_productId_sku_key" ON "product_variations"("productId", "sku");
