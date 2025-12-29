-- Migration to add roll_no to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_no TEXT;

-- Index for roll_no is often useful for search
CREATE INDEX IF NOT EXISTS idx_users_roll_no ON users(roll_no);
