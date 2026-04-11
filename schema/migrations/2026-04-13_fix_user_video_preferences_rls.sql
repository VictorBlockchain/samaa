-- Enable RLS on user_video_preferences table
ALTER TABLE user_video_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS user_video_preferences_read_own ON user_video_preferences;
DROP POLICY IF EXISTS user_video_preferences_insert_own ON user_video_preferences;
DROP POLICY IF EXISTS user_video_preferences_update_own ON user_video_preferences;
DROP POLICY IF EXISTS user_video_preferences_delete_own ON user_video_preferences;

-- Allow authenticated users to read their own preferences
CREATE POLICY user_video_preferences_read_own ON user_video_preferences
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Allow authenticated users to insert their own preferences
CREATE POLICY user_video_preferences_insert_own ON user_video_preferences
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own preferences
CREATE POLICY user_video_preferences_update_own ON user_video_preferences
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Allow authenticated users to delete their own preferences
CREATE POLICY user_video_preferences_delete_own ON user_video_preferences
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_video_preferences TO authenticated;
