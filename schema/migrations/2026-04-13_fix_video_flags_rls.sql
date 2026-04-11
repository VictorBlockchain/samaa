-- Fix video_flags RLS policies to avoid 406 errors
-- The issue is that when no rows match, PostgREST returns 406

-- First, ensure RLS is enabled
ALTER TABLE video_flags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS video_flags_create ON video_flags;
DROP POLICY IF EXISTS video_flags_read_own ON video_flags;
DROP POLICY IF EXISTS video_flags_read_all ON video_flags;

-- Policy: Allow authenticated users to create flags
CREATE POLICY video_flags_create ON video_flags
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Allow users to read their own flags
CREATE POLICY video_flags_read_own ON video_flags
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Policy: Allow users to see if they've flagged a specific video
-- This is needed for the hasUserFlagged check
CREATE POLICY video_flags_check_video ON video_flags
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT ON video_flags TO authenticated;

-- Also fix video_likes if it has similar issues
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS video_likes_read ON video_likes;
DROP POLICY IF EXISTS video_likes_create ON video_likes;
DROP POLICY IF EXISTS video_likes_delete_own ON video_likes;

-- Allow users to read all likes (needed for counts)
CREATE POLICY video_likes_read ON video_likes
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow users to create their own likes
CREATE POLICY video_likes_create ON video_likes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own likes
CREATE POLICY video_likes_delete_own ON video_likes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON video_likes TO authenticated;
