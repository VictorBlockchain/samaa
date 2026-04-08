BEGIN;

CREATE OR REPLACE FUNCTION public.bucket_exists(p_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets b WHERE b.name = p_name
  );
$$;

COMMIT;
