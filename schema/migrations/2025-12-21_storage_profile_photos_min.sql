BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'create_bucket' AND n.nspname = 'storage'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-photos') THEN
      PERFORM storage.create_bucket('profile-photos', true);
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner of storage.objects; skipping RLS enable';
  END;

  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS profile_photos_anon_select ON storage.objects';
    EXECUTE $P$CREATE POLICY profile_photos_anon_select ON storage.objects
      FOR SELECT TO anon
      USING (
        EXISTS (
          SELECT 1 FROM storage.buckets b
          WHERE b.id = storage.objects.bucket_id AND b.name = 'profile-photos'
        )
      )$P$;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner; skipping select policy';
  END;

  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS profile_photos_anon_insert ON storage.objects';
    EXECUTE $P$CREATE POLICY profile_photos_anon_insert ON storage.objects
      FOR INSERT TO anon
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM storage.buckets b
          WHERE b.id = storage.objects.bucket_id AND b.name = 'profile-photos'
        )
      )$P$;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner; skipping insert policy';
  END;
END $$;

COMMIT;
