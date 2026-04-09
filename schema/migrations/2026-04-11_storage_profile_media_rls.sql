-- Profile media buckets: private (no anonymous web access). Use signed URLs in the app.
-- Authenticated users may upload/update/delete only under their own folder: <auth.uid()>/<file>
-- Any logged-in user may READ objects in these buckets so profiles work in-app (anon cannot).

UPDATE storage.buckets SET public = false WHERE id IN ('profile-photos', 'profile-videos', 'profile-audio');

-- profile-photos
DROP POLICY IF EXISTS "profile_photos_insert_own" ON storage.objects;
CREATE POLICY "profile_photos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_photos_update_own" ON storage.objects;
CREATE POLICY "profile_photos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_photos_delete_own" ON storage.objects;
CREATE POLICY "profile_photos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_photos_select_authenticated" ON storage.objects;
CREATE POLICY "profile_photos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos');

-- profile-videos
DROP POLICY IF EXISTS "profile_videos_insert_own" ON storage.objects;
CREATE POLICY "profile_videos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-videos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_videos_update_own" ON storage.objects;
CREATE POLICY "profile_videos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-videos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'profile-videos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_videos_delete_own" ON storage.objects;
CREATE POLICY "profile_videos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-videos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_videos_select_authenticated" ON storage.objects;
CREATE POLICY "profile_videos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-videos');

-- profile-audio
DROP POLICY IF EXISTS "profile_audio_insert_own" ON storage.objects;
CREATE POLICY "profile_audio_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-audio'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_audio_update_own" ON storage.objects;
CREATE POLICY "profile_audio_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-audio'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'profile-audio'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_audio_delete_own" ON storage.objects;
CREATE POLICY "profile_audio_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-audio'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "profile_audio_select_authenticated" ON storage.objects;
CREATE POLICY "profile_audio_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-audio');

ALTER TABLE public.users
ADD COLUMN living_arrangements TEXT;