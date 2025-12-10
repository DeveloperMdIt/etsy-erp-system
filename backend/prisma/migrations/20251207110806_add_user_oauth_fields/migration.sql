-- AlterTable
ALTER TABLE "users" ADD COLUMN "etsyAccessToken" TEXT;
ALTER TABLE "users" ADD COLUMN "etsyRefreshToken" TEXT;
ALTER TABLE "users" ADD COLUMN "etsyShopId" TEXT;
ALTER TABLE "users" ADD COLUMN "etsyUserId" TEXT;
ALTER TABLE "users" ADD COLUMN "shopName" TEXT;
ALTER TABLE "users" ADD COLUMN "tokenExpiresAt" DATETIME;
