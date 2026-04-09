-- Add hair_style and make_up_style columns to users table
-- These track female users' beauty preferences

ALTER TABLE users
ADD COLUMN IF NOT EXISTS hair_style TEXT,
ADD COLUMN IF NOT EXISTS make_up_style TEXT;

-- Add indexes for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_users_hair_style ON users(hair_style);
CREATE INDEX IF NOT EXISTS idx_users_make_up_style ON users(make_up_style);
