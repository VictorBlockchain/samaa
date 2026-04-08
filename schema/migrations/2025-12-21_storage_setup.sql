BEGIN;

-- Create media buckets if storage extension is available
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
  ELSE
    RAISE NOTICE 'Supabase storage extension not available; bucket creation skipped';
  END IF;
END $$;

-- Enable RLS and add policies for anon to insert/select in media buckets
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner of storage.objects; skipping RLS enable';
  END;

  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS objects_anon_select ON storage.objects';
    EXECUTE $POLICY$CREATE POLICY objects_anon_select ON storage.objects
      FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM storage.buckets b
          WHERE b.id = storage.objects.bucket_id
            AND b.name IN ('profile-photos','profile-videos','profile-audio','shop-images','shop-videos')
        )
      )$POLICY$;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner; skipping select policy creation';
  END;

  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS objects_anon_insert_media ON storage.objects';
    EXECUTE $POLICY$CREATE POLICY objects_anon_insert_media ON storage.objects
      FOR INSERT TO anon
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM storage.buckets b
          WHERE b.id = storage.objects.bucket_id
            AND b.name IN ('profile-photos','profile-videos','profile-audio','shop-images','shop-videos')
        )
      )$POLICY$;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner; skipping insert policy creation';
  END;
END $$;

-- Helper RPC to check bucket existence from client
CREATE OR REPLACE FUNCTION public.bucket_exists(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM storage.buckets b WHERE b.name = p_name);
$$;

COMMIT;
