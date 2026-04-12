-- Add role column to users table for admin access control
-- Date: 2026-04-15

-- ============================================================================
-- 1. ADD ROLE COLUMN TO USERS TABLE
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. ADD COMMENT
-- ============================================================================

COMMENT ON COLUMN users.role IS 'User role for access control: user, admin, or moderator';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- After running this, set your user as admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
-- ============================================================================
