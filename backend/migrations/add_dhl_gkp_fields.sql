-- Add DHL Paket (GKP) fields to UserSettings
ALTER TABLE "userSettings" ADD COLUMN IF NOT EXISTS "dhlGkpUsername" TEXT;
ALTER TABLE "userSettings" ADD COLUMN IF NOT EXISTS "dhlGkpPassword" TEXT;
ALTER TABLE "userSettings" ADD COLUMN IF NOT EXISTS "dhlEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "userSettings" ADD COLUMN IF NOT EXISTS "printerDHL" TEXT;
