-- Add DHL Paket (GKP) fields to user_settings (corrected table name)
ALTER TABLE user_settings ADD COLUMN dhlGkpUsername TEXT;
ALTER TABLE user_settings ADD COLUMN dhlGkpPassword TEXT;
ALTER TABLE user_settings ADD COLUMN dhlEnabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN printerDHL TEXT;
