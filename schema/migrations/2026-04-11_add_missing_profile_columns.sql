-- Add missing columns to users table for profile setup
-- Date: 2026-04-11

-- Add family_involvement column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS family_involvement TEXT;

-- Add living_arrangements column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS living_arrangements TEXT;

-- Add islamic_values column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS islamic_values TEXT;

-- Add sect column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS sect TEXT;

-- Add psychedelics_types column if it doesn't exist (array of text)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS psychedelics_types TEXT[];

-- Add personality column if it doesn't exist (array of text)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS personality TEXT[];

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_family_involvement ON users(family_involvement);
CREATE INDEX IF NOT EXISTS idx_users_living_arrangements ON users(living_arrangements);
CREATE INDEX IF NOT EXISTS idx_users_islamic_values ON users(islamic_values);
CREATE INDEX IF NOT EXISTS idx_users_sect ON users(sect);
CREATE INDEX IF NOT EXISTS idx_users_psychedelics_types ON users USING GIN (psychedelics_types);
CREATE INDEX IF NOT EXISTS idx_users_personality ON users USING GIN (personality);

-- Add comments for documentation
COMMENT ON COLUMN users.family_involvement IS 'Family involvement level in marriage process: involved, somewhat, minimal';
COMMENT ON COLUMN users.living_arrangements IS 'Living arrangement: alone, with_family, with_roommates';
COMMENT ON COLUMN users.islamic_values IS 'Islamic values orientation: traditional, balanced, modern';
COMMENT ON COLUMN users.sect IS 'Islamic sect: Sunni, Shia, Other';
COMMENT ON COLUMN users.psychedelics_types IS 'Array of psychedelic types used: mushroom, cannabis, other';
COMMENT ON COLUMN users.personality IS 'Array of personality traits';
