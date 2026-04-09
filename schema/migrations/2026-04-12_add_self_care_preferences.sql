-- Add self_care_frequency, self_care_budget, and shopping_frequency columns to users table
-- These track user's self care habits, budget preferences, and shopping frequency

ALTER TABLE users
ADD COLUMN IF NOT EXISTS self_care_frequency TEXT,
ADD COLUMN IF NOT EXISTS self_care_budget TEXT,
ADD COLUMN IF NOT EXISTS shopping_frequency TEXT;

-- Add indexes for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_users_self_care_frequency ON users(self_care_frequency);
CREATE INDEX IF NOT EXISTS idx_users_self_care_budget ON users(self_care_budget);
CREATE INDEX IF NOT EXISTS idx_users_shopping_frequency ON users(shopping_frequency);
