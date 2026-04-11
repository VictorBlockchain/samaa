-- Create RPC function to increment video views
-- This avoids RLS issues with direct updates

CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE social_videos
    SET views = views + 1
    WHERE id = video_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO anon;

-- Also create helper functions for increment/decrement if needed
CREATE OR REPLACE FUNCTION increment(x INT)
RETURNS INT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT x + 1;
$$;

CREATE OR REPLACE FUNCTION decrement(x INT)
RETURNS INT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT x - 1;
$$;

GRANT EXECUTE ON FUNCTION increment(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement(INT) TO authenticated;
