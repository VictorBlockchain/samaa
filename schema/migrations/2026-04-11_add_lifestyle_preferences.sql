-- Add lifestyle preference columns to users table
-- Date: 2026-04-11

-- Add finance_style column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS finance_style TEXT;

-- Add dining_frequency column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS dining_frequency TEXT;

-- Add travel_frequency column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS travel_frequency TEXT;

-- Add hair_style column (female only)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS hair_style TEXT;

-- Add polygamy_reason column (male only)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS polygamy_reason TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_finance_style ON users(finance_style);
CREATE INDEX IF NOT EXISTS idx_users_dining_frequency ON users(dining_frequency);
CREATE INDEX IF NOT EXISTS idx_users_travel_frequency ON users(travel_frequency);
CREATE INDEX IF NOT EXISTS idx_users_hair_style ON users(hair_style);

-- Add comments for documentation
COMMENT ON COLUMN users.finance_style IS 'Finance style: thrift, luxury, responsible, saver';
COMMENT ON COLUMN users.dining_frequency IS 'Fine dining frequency: once_week, three_week, frequently, rarely';
COMMENT ON COLUMN users.travel_frequency IS 'Travel frequency: weekly, monthly, frequently, rarely';
COMMENT ON COLUMN users.hair_style IS 'Hair style preference (female only): natural, wigs_weaves';
COMMENT ON COLUMN users.polygamy_reason IS 'Reason for wanting multiple wives (male only): text explanation';
