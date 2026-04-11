-- Create social-videos storage bucket as PRIVATE
-- All access via signed URLs (same pattern as profile-photos, profile-videos)

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-videos', 'social-videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Ensure bucket is private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'social-videos';
