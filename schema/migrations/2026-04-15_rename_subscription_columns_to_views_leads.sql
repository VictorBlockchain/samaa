-- Rename subscription table columns from likes/compliments to views/leads
-- Date: 2026-04-15

-- ============================================================================
-- 1. RENAME SUBSCRIPTION COLUMNS
-- ============================================================================

ALTER TABLE subscriptions RENAME COLUMN likes_included TO views_included;
ALTER TABLE subscriptions RENAME COLUMN compliments_included TO leads_included;
ALTER TABLE subscriptions RENAME COLUMN likes_used TO views_used;
ALTER TABLE subscriptions RENAME COLUMN compliments_used TO leads_used;

-- ============================================================================
-- 2. ADD NEXT PAYMENT DATE COLUMN
-- ============================================================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
