-- Fix missing columns in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_no TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Notify PostgREST to reload schema cache to recognize the new columns
NOTIFY pgrst, 'reload config';
