-- Add new fields to users table for Basic Info tab
-- Date: 2026-04-11

-- Add willing_to_relocate field
ALTER TABLE users
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT FALSE;

-- Add mahr_max_amount field (for males)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS mahr_max_amount NUMERIC(10, 2);

-- Add mahr_requirement field (for females)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS mahr_requirement NUMERIC(10, 2);

-- Add work_preference field (for females)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS work_preference TEXT;

-- Add style_preference field (for females)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS style_preference TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_willing_to_relocate ON users(willing_to_relocate);
CREATE INDEX IF NOT EXISTS idx_users_mahr_max_amount ON users(mahr_max_amount);
CREATE INDEX IF NOT EXISTS idx_users_mahr_requirement ON users(mahr_requirement);
CREATE INDEX IF NOT EXISTS idx_users_work_preference ON users(work_preference);
CREATE INDEX IF NOT EXISTS idx_users_style_preference ON users(style_preference);

-- Add comments for documentation
COMMENT ON COLUMN users.willing_to_relocate IS 'Whether the user is willing to relocate for marriage';
COMMENT ON COLUMN users.mahr_max_amount IS 'Maximum mahr amount the male user is willing to pay';
COMMENT ON COLUMN users.mahr_requirement IS 'Mahr amount required by the female user';
COMMENT ON COLUMN users.work_preference IS 'Work preference for female users: home_maker, self_employed, career';
COMMENT ON COLUMN users.style_preference IS 'Style preference for female users: traditional, modern, feminist';
