-- Add chat_rating column to users table
-- This tracks the percentage of chat responses (chat responsiveness)

ALTER TABLE users
ADD COLUMN IF NOT EXISTS chat_rating INTEGER DEFAULT 0 CHECK (chat_rating >= 0 AND chat_rating <= 100);

-- Add index for chat_rating to support sorting/filtering
CREATE INDEX IF NOT EXISTS idx_users_chat_rating ON users(chat_rating);

-- Update views that select user ratings to include chat_rating
-- Note: You may need to recreate views that reference the users table columns explicitly
