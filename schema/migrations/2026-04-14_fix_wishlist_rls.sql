-- ============================================================================
-- Fix wishlist table RLS policies
-- ============================================================================

-- Enable RLS on wishlists table
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON wishlists;

-- Allow authenticated users to view their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow authenticated users to add to their own wishlist
CREATE POLICY "Users can add to own wishlist" ON wishlists
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON wishlists
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON wishlists TO authenticated;

-- Also grant usage on the RPC functions if they exist
-- These functions should be SECURITY DEFINER so they bypass RLS
-- but we need to ensure authenticated users can execute them
GRANT EXECUTE ON FUNCTION add_to_wishlist TO authenticated;
GRANT EXECUTE ON FUNCTION remove_from_wishlist TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_wishlist TO authenticated;
