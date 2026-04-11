-- ============================================================================
-- Add shipped_by column to orders table
-- ============================================================================

-- Add shipped_by column
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS shipped_by VARCHAR(50) CHECK (shipped_by IN ('ups', 'usps', 'fedex', 'dhl', 'other', NULL));

-- Add comment
COMMENT ON COLUMN orders.shipped_by IS 'Shipping carrier: ups, usps, fedex, dhl, or other';

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'shipped_by';
