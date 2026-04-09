-- Add custom_interests column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS custom_interests TEXT[];

CREATE INDEX IF NOT EXISTS idx_users_custom_interests ON users USING GIN(custom_interests);
