-- Add all missing lifestyle and preference columns to users table
-- This migration consolidates all recent additions

ALTER TABLE users
ADD COLUMN IF NOT EXISTS self_care_frequency TEXT,
ADD COLUMN IF NOT EXISTS self_care_budget TEXT,
ADD COLUMN IF NOT EXISTS shopping_frequency TEXT,
ADD COLUMN IF NOT EXISTS hair_style TEXT,
ADD COLUMN IF NOT EXISTS make_up_style TEXT,
ADD COLUMN IF NOT EXISTS dining_frequency TEXT,
ADD COLUMN IF NOT EXISTS finance_style TEXT,
ADD COLUMN IF NOT EXISTS travel_frequency TEXT,
ADD COLUMN IF NOT EXISTS living_arrangements TEXT,
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mahr_max_amount TEXT,
ADD COLUMN IF NOT EXISTS mahr_requirement TEXT,
ADD COLUMN IF NOT EXISTS work_preference TEXT,
ADD COLUMN IF NOT EXISTS style_preference TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wants_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS want_children TEXT,
ADD COLUMN IF NOT EXISTS bio_tagline TEXT,
ADD COLUMN IF NOT EXISTS sect TEXT,
ADD COLUMN IF NOT EXISTS islamic_values TEXT,
ADD COLUMN IF NOT EXISTS family_involvement TEXT,
ADD COLUMN IF NOT EXISTS psychedelics_types TEXT[],
ADD COLUMN IF NOT EXISTS personality TEXT[],
ADD COLUMN IF NOT EXISTS married_before BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS polygamy_reason TEXT,
ADD COLUMN IF NOT EXISTS chat_rating INTEGER DEFAULT 0 CHECK (chat_rating >= 0 AND chat_rating <= 100);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_users_self_care_frequency ON users(self_care_frequency);
CREATE INDEX IF NOT EXISTS idx_users_self_care_budget ON users(self_care_budget);
CREATE INDEX IF NOT EXISTS idx_users_shopping_frequency ON users(shopping_frequency);
CREATE INDEX IF NOT EXISTS idx_users_hair_style ON users(hair_style);
CREATE INDEX IF NOT EXISTS idx_users_make_up_style ON users(make_up_style);
CREATE INDEX IF NOT EXISTS idx_users_dining_frequency ON users(dining_frequency);
CREATE INDEX IF NOT EXISTS idx_users_finance_style ON users(finance_style);
CREATE INDEX IF NOT EXISTS idx_users_travel_frequency ON users(travel_frequency);
CREATE INDEX IF NOT EXISTS idx_users_marital_status ON users(marital_status);
CREATE INDEX IF NOT EXISTS idx_users_chat_rating ON users(chat_rating);
