-- Rename available_likes to available_views and available_compliments to available_leads
-- Safe migration with existence checks

-- Rename available_compliments to available_leads
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'available_compliments'
  ) THEN
    ALTER TABLE users RENAME COLUMN available_compliments TO available_leads;
  END IF;
END $$;

-- Rename available_likes to available_views
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'available_likes'
  ) THEN
    ALTER TABLE users RENAME COLUMN available_likes TO available_views;
  END IF;
END $$;

-- Update message type from 'compliment' to 'lead'
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check 
  CHECK (type IN ('message', 'lead', 'compliment')); -- Keep 'compliment' for backward compatibility

-- Update existing compliment messages to lead
UPDATE messages SET type = 'lead' WHERE type = 'compliment';

-- Final constraint with only new types
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check 
  CHECK (type IN ('message', 'lead'));
