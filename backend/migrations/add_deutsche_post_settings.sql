-- Migration: Add Deutsche Post settings to user_settings
-- This migration adds new columns without data loss

-- Add Etsy sync toggle
ALTER TABLE user_settings ADD COLUMN etsySyncEnabled INTEGER DEFAULT 1 NOT NULL;

-- Add Deutsche Post Internetmarke settings
ALTER TABLE user_settings ADD COLUMN deutschePostUsername TEXT;
ALTER TABLE user_settings ADD COLUMN deutschePostPassword TEXT;
ALTER TABLE user_settings ADD COLUMN deutschePostClientId TEXT;
ALTER TABLE user_settings ADD COLUMN deutschePostClientSecret TEXT;
ALTER TABLE user_settings ADD COLUMN deutschePostWalletBalance REAL DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN deutschePostEnabled INTEGER DEFAULT 0 NOT NULL;

-- Add Label Layout Settings
ALTER TABLE user_settings ADD COLUMN labelLogoPath TEXT;
ALTER TABLE user_settings ADD COLUMN labelCompanyName TEXT;
ALTER TABLE user_settings ADD COLUMN labelStreet TEXT;
ALTER TABLE user_settings ADD COLUMN labelPostalCode TEXT;
ALTER TABLE user_settings ADD COLUMN labelCity TEXT;
ALTER TABLE user_settings ADD COLUMN labelCountry TEXT DEFAULT 'Deutschland';
ALTER TABLE user_settings ADD COLUMN labelPhone TEXT;
ALTER TABLE user_settings ADD COLUMN labelEmail TEXT;

-- Add Label Size Settings
ALTER TABLE user_settings ADD COLUMN labelSizePreset TEXT DEFAULT 'A5';
ALTER TABLE user_settings ADD COLUMN labelCustomWidth INTEGER;
ALTER TABLE user_settings ADD COLUMN labelCustomHeight INTEGER;

-- Add Printer Settings
ALTER TABLE user_settings ADD COLUMN defaultPrinter TEXT;
ALTER TABLE user_settings ADD COLUMN autoPrintEnabled INTEGER DEFAULT 1 NOT NULL;

-- Add Printer per Shipping Provider
ALTER TABLE user_settings ADD COLUMN printerDeutschePost TEXT;
ALTER TABLE user_settings ADD COLUMN printerDHL TEXT;
ALTER TABLE user_settings ADD COLUMN printerDPD TEXT;
