-- Shop Storage Bucket RLS Policies
-- shop-images and shop-videos buckets are private (set in schema.sql).
-- Authenticated users who own a shop can upload/update/delete files under their shop_id folder.
-- Any authenticated user can view shop images/videos (for browsing the store).

-- ============================================================
-- shop-images
-- ============================================================

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "shop_images_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "shop_images_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "shop_images_update_own" ON storage.objects;
DROP POLICY IF EXISTS "shop_images_delete_own" ON storage.objects;

-- INSERT: Authenticated shop owners can upload to their shop folder
CREATE POLICY "shop_images_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'shop-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- SELECT: Any authenticated user can view shop images (for product browsing)
CREATE POLICY "shop_images_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'shop-images');

-- UPDATE: Shop owners can update their own shop images
CREATE POLICY "shop_images_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'shop-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'shop-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- DELETE: Shop owners can delete their own shop images
CREATE POLICY "shop_images_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'shop-images'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- shop-videos
-- ============================================================

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "shop_videos_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "shop_videos_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "shop_videos_update_own" ON storage.objects;
DROP POLICY IF EXISTS "shop_videos_delete_own" ON storage.objects;

-- INSERT: Authenticated shop owners can upload to their shop folder
CREATE POLICY "shop_videos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'shop-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- SELECT: Any authenticated user can view shop videos
CREATE POLICY "shop_videos_select_authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'shop-videos');

-- UPDATE: Shop owners can update their own shop videos
CREATE POLICY "shop_videos_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'shop-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'shop-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );

-- DELETE: Shop owners can delete their own shop videos
CREATE POLICY "shop_videos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'shop-videos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.shops WHERE owner_id = auth.uid()
    )
  );
