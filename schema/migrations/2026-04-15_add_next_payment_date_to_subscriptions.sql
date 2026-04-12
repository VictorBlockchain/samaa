-- Add next_payment_date column to subscriptions table
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD NEXT PAYMENT DATE COLUMN
-- ============================================================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
