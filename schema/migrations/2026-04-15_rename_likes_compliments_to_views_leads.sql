-- Rename admin_settings columns from likes/compliments to views/leads
-- This aligns with the rebranded engagement mechanics
-- Date: 2026-04-15

-- ============================================================================
-- 1. RENAME LIKES COLUMNS TO VIEWS
-- ============================================================================

ALTER TABLE admin_settings RENAME COLUMN likes_25_price TO views_25_price;
ALTER TABLE admin_settings RENAME COLUMN likes_50_price TO views_50_price;
ALTER TABLE admin_settings RENAME COLUMN likes_100_price TO views_100_price;
ALTER TABLE admin_settings RENAME COLUMN likes_250_price TO views_250_price;
ALTER TABLE admin_settings RENAME COLUMN likes_500_price TO views_500_price;

-- ============================================================================
-- 2. RENAME COMPLIMENTS COLUMNS TO LEADS
-- ============================================================================

ALTER TABLE admin_settings RENAME COLUMN compliments_25_price TO leads_25_price;
ALTER TABLE admin_settings RENAME COLUMN compliments_50_price TO leads_50_price;
ALTER TABLE admin_settings RENAME COLUMN compliments_100_price TO leads_100_price;
ALTER TABLE admin_settings RENAME COLUMN compliments_250_price TO leads_250_price;
ALTER TABLE admin_settings RENAME COLUMN compliments_500_price TO leads_500_price;

-- ============================================================================
-- 3. RENAME COMMUNITY FUND COLUMNS
-- ============================================================================

ALTER TABLE community_fund RENAME COLUMN total_likes_contrib TO total_views_contrib;
ALTER TABLE community_fund RENAME COLUMN total_compliments_contrib TO total_leads_contrib;

-- ============================================================================
-- 4. RENAME SUBSCRIPTION COLUMNS
-- ============================================================================

ALTER TABLE subscriptions RENAME COLUMN likes_included TO views_included;
ALTER TABLE subscriptions RENAME COLUMN compliments_included TO leads_included;
ALTER TABLE subscriptions RENAME COLUMN likes_used TO views_used;
ALTER TABLE subscriptions RENAME COLUMN compliments_used TO leads_used;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
