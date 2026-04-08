BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.bio_uniqueness_percent(p_bio TEXT, p_neighbors INTEGER DEFAULT 25)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH sims AS (
  SELECT similarity(u.bio, p_bio) AS sim
  FROM public.users u
  WHERE u.bio IS NOT NULL AND u.bio <> ''
  ORDER BY similarity(u.bio, p_bio) DESC
  LIMIT p_neighbors
)
SELECT ROUND((1 - COALESCE(MAX(sim), 0)) * 100)::INT FROM sims
$$;

CREATE INDEX IF NOT EXISTS idx_users_bio_trgm ON public.users USING GIN (bio gin_trgm_ops);

GRANT EXECUTE ON FUNCTION public.bio_uniqueness_percent(TEXT, INTEGER) TO anon;

COMMIT;
