-- ============================================================================
-- Add Shop Fee and Order Payout Tracking
-- ============================================================================

-- Step 1: Add shop_fee to shops table
ALTER TABLE shops 
  ADD COLUMN IF NOT EXISTS shop_fee INTEGER NOT NULL DEFAULT 13;

-- Add check constraint to ensure fee is between 0 and 100
ALTER TABLE shops 
  ADD CONSTRAINT shops_shop_fee_check CHECK (shop_fee >= 0 AND shop_fee <= 100);

-- Step 2: Add payout tracking to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS fee_collected NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS amount_earned NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payout_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payout_method VARCHAR(50) CHECK (payout_method IN ('paypal', 'stripe', 'bitcoin', NULL));

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payout_transaction_id VARCHAR(255);

-- Step 3: Add comment explaining the columns
COMMENT ON COLUMN shops.shop_fee IS 'Service fee percentage (e.g., 13 = 13%). Applied to all orders for this shop.';
COMMENT ON COLUMN orders.fee_collected IS 'The fee amount collected from this order (calculated from total_amount * shop_fee / 100)';
COMMENT ON COLUMN orders.amount_earned IS 'Net amount after fees (total_amount - fee_collected)';
COMMENT ON COLUMN orders.payout_date IS 'When the payout was processed';
COMMENT ON COLUMN orders.payout_method IS 'Payment method used for payout: paypal, stripe, or bitcoin';
COMMENT ON COLUMN orders.payout_transaction_id IS 'Transaction ID from the payout provider';

-- Step 4: Update existing shops to have 13% default fee
UPDATE shops 
SET shop_fee = 13 
WHERE shop_fee = 0 OR shop_fee IS NULL;

-- Step 5: Recalculate fee_collected and amount_earned for existing orders
-- (This requires knowing the shop_fee at the time of order)
UPDATE orders o
SET 
  fee_collected = ROUND(o.total_amount * s.shop_fee / 100, 2),
  amount_earned = o.total_amount - ROUND(o.total_amount * s.shop_fee / 100, 2)
FROM shops s
WHERE o.shop_id = s.id 
  AND (o.fee_collected = 0 OR o.fee_collected IS NULL);

-- Step 6: Verify changes
SELECT 'Shops Table - shop_fee column:' as info;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'shops' AND column_name = 'shop_fee';

SELECT 'Orders Table - New columns:' as info;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name IN ('fee_collected', 'amount_earned', 'payout_date', 'payout_method', 'payout_transaction_id')
ORDER BY ordinal_position;

SELECT 'Sample shop with fee:' as info;
SELECT id, name, shop_fee FROM shops LIMIT 3;

SELECT 'Sample order with fees:' as info;
SELECT order_number, total_amount, fee_collected, amount_earned, payout_method 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
