-- Rename subscription table columns from likes/compliments to views/leads
-- Date: 2026-04-15

-- ============================================================================
-- 1. RENAME SUBSCRIPTION COLUMNS (only if old columns exist)
-- ============================================================================

DO $$ 
BEGIN
    -- Rename likes_included to views_included if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'likes_included'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN likes_included TO views_included;
    END IF;

    -- Rename compliments_included to leads_included if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'compliments_included'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN compliments_included TO leads_included;
    END IF;

    -- Rename likes_used to views_used if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'likes_used'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN likes_used TO views_used;
    END IF;

    -- Rename compliments_used to leads_used if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'compliments_used'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN compliments_used TO leads_used;
    END IF;
END $$;

-- ============================================================================
-- 2. ADD NEXT PAYMENT DATE COLUMN
-- ============================================================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
