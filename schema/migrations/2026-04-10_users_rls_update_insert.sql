-- Allow authenticated users to INSERT and UPDATE their own row in public.users.
-- Without these policies, PostgREST UPDATE affects 0 rows and .single() returns PGRST116 / 406.
-- Run in Supabase SQL Editor after reviewing policies.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- UPDATE: user may change only their own profile row
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: user may create a row only when id matches auth user (links profile to auth.users)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
