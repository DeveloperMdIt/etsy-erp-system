-- Add userId to products, orders, customers
-- First add the column (nullable temporarily)
ALTER TABLE products ADD COLUMN userId TEXT;
ALTER TABLE orders ADD COLUMN userId TEXT;
ALTER TABLE customers ADD COLUMN userId TEXT;

-- Get the first user's ID and update all records
-- Note: This will be executed manually with the actual user ID
