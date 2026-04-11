-- ============================================================================
-- Fix order_items to support both product_id and variant_id
-- This allows orders without requiring product variants (simpler flow)
-- ============================================================================

-- Add product_id column to order_items (nullable, for backward compatibility)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE RESTRICT;

-- Make variant_id nullable (since we might not always use variants)
ALTER TABLE order_items 
ALTER COLUMN variant_id DROP NOT NULL;

-- Add check constraint: at least one of product_id or variant_id must be set
ALTER TABLE order_items
ADD CONSTRAINT order_items_product_or_variant CHECK (
  product_id IS NOT NULL OR variant_id IS NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- Update RLS policies to include product_id in checks
-- (existing policies should still work since they join through orders)

COMMENT ON COLUMN order_items.product_id IS 'Product ID (used when no variant is selected)';
COMMENT ON COLUMN order_items.variant_id IS 'Product variant ID (nullable if no variant)';
