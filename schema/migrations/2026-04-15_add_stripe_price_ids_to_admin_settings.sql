-- Add Stripe Price ID columns to admin_settings table
-- This allows using Stripe's managed recurring prices instead of ad-hoc price creation
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD STRIPE PRICE ID COLUMNS
-- ============================================================================

ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS stripe_subscription_monthly_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_yearly_price_id TEXT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
