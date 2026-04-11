-- Auto-populate location_point geography column from latitude/longitude
-- This is critical for PostGIS geofencing in the matchmaking algorithm
-- Date: 2026-04-11

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location_point := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_update_location_point'
  ) THEN
    CREATE TRIGGER users_update_location_point
    BEFORE INSERT OR UPDATE OF latitude, longitude ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();
  END IF;
END $$;

-- Backfill existing rows that have lat/lng but no location_point
UPDATE users
SET location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location_point IS NULL;
