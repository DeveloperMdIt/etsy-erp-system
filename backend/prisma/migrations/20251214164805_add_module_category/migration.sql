-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Allgemein',
    "price" REAL NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPlanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_modules" ("createdAt", "description", "id", "isActive", "isPlanned", "key", "name", "price", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "isPlanned", "key", "name", "price", "updatedAt" FROM "modules";
DROP TABLE "modules";
ALTER TABLE "new_modules" RENAME TO "modules";
CREATE UNIQUE INDEX "modules_key_key" ON "modules"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
