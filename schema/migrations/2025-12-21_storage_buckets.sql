BEGIN;

-- Create storage buckets if storage extension is present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'create_bucket' AND n.nspname = 'storage'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-photos') THEN
      PERFORM storage.create_bucket('profile-photos'::text, true, 52428800::bigint, ARRAY['image/jpeg','image/jpg','image/png','image/webp']::text[]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-videos') THEN
      PERFORM storage.create_bucket('profile-videos'::text, true, 52428800::bigint, ARRAY['video/mp4','video/webm','video/mov','video/avi']::text[]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-audio') THEN
      PERFORM storage.create_bucket('profile-audio'::text, true, 52428800::bigint, ARRAY['audio/mp3','audio/wav','audio/m4a','audio/ogg']::text[]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'shop-images') THEN
      PERFORM storage.create_bucket('shop-images'::text, true, 52428800::bigint, ARRAY['image/jpeg','image/jpg','image/png','image/webp']::text[]);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'shop-videos') THEN
      PERFORM storage.create_bucket('shop-videos'::text, true, 52428800::bigint, ARRAY['video/mp4','video/webm','video/mov','video/avi']::text[]);
    END IF;
  END IF;
END $$;

-- Optionally set buckets to private
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_bucket' AND n.nspname = 'storage'
  ) THEN
    PERFORM storage.update_bucket('profile-photos'::text, true);
    PERFORM storage.update_bucket('profile-videos'::text, true);
    PERFORM storage.update_bucket('profile-audio'::text, true);
    PERFORM storage.update_bucket('shop-images'::text, true);
    PERFORM storage.update_bucket('shop-videos'::text, true);
  END IF;
END $$;

COMMIT;
