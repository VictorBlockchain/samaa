-- Enable RLS on admin_settings table (if not already enabled)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to admin_settings" ON admin_settings;

-- Create policy to allow all users (including anonymous) to read admin_settings
-- This is safe because admin_settings contains public configuration like pricing
CREATE POLICY "Allow public read access to admin_settings" ON admin_settings
  FOR SELECT
  USING (true);

-- Note: We use `using (true)` instead of `using (auth.role() = 'authenticated')` 
-- because we want unauthenticated users to also be able to see pricing/products
