-- Create user video preferences table
CREATE TABLE IF NOT EXISTS user_video_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_categories UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_video_preferences_user_id ON user_video_preferences(user_id);

-- Enable RLS
ALTER TABLE user_video_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY user_video_preferences_read_own ON user_video_preferences
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY user_video_preferences_insert_own ON user_video_preferences
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY user_video_preferences_update_own ON user_video_preferences
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_video_preferences TO authenticated;
