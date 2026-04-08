BEGIN;

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

COMMIT;
