-- Social Videos Storage Bucket RLS Policies
-- Videos are private - only playable within the authenticated application
-- No public/anonymous access allowed

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read all videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;

-- Policy: Allow authenticated users to upload videos
-- Organizes videos by user_id folder structure: user_id/filename
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'social-videos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow ANY authenticated user to view ANY video
-- This enables the social feed - users can watch each other's videos
-- But ONLY within the app (no public URLs work without auth)
CREATE POLICY "Authenticated users can view all videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'social-videos'
);

-- Policy: Allow users to delete only their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'social-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update only their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'social-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'social-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
