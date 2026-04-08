-- Migration 008: Enhanced Order Management
-- Date: 2026-04-08
-- Purpose: Add comprehensive order tracking, refund management, and delivery fields

-- Update order_status enum to include all required statuses
-- Note: PostgreSQL doesn't support ALTER TYPE to remove values, only add
-- We need to drop the default, change type, then restore it

-- Step 1: Drop the existing default
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- Step 2: Create the new enum type
CREATE TYPE order_status_new AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'on_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'return_in_progress',
  'returned',
  'refunded'
);

-- Step 3: Convert existing data to the new enum
ALTER TABLE orders 
  ALTER COLUMN status TYPE order_status_new 
  USING status::text::order_status_new;

-- Step 4: Drop the old enum (CASCADE to drop dependent functions)
DROP TYPE order_status CASCADE;

-- Step 5: Rename the new enum to the original name
ALTER TYPE order_status_new RENAME TO order_status;

-- Step 6: Restore the default value
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- Add missing fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'in_progress', 'partial', 'full', 'rejected'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) DEFAULT 0 CHECK (refund_amount >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;

-- Stripe payment tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;

-- Delivery tracking enhancements
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_signature_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned_to_sender'));

-- Cancellation tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id);

-- Return tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_carrier VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_requested_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_approved_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_received_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_condition_notes TEXT;

-- Shop and fulfillment
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(50) DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0;

-- Customer communication
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_preferences JSONB; -- {email: true, sms: false, etc.}

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_refund_status ON orders(refund_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled ON orders(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_return_status ON orders(return_requested_at);

-- Add comments for documentation
COMMENT ON COLUMN orders.status IS 'Current order lifecycle status';
COMMENT ON COLUMN orders.payment_status IS 'Payment gateway status (pending, completed, failed, refunded)';
COMMENT ON COLUMN orders.refund_status IS 'Refund processing status';
COMMENT ON COLUMN orders.delivery_status IS 'Delivery carrier status';
COMMENT ON COLUMN orders.fulfillment_status IS 'Shop fulfillment status (items packed and shipped)';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe Checkout Session ID';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID';
COMMENT ON COLUMN orders.stripe_charge_id IS 'Stripe Charge ID (after payment completion)';

-- Create function to update order status timestamps
CREATE OR REPLACE FUNCTION update_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Track payment completion
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.payment_completed_at = NOW();
  END IF;

  -- Track cancellation
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;

  -- Track delivery
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = NOW();
    NEW.delivery_status = 'delivered';
  END IF;

  -- Track return
  IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
    NEW.return_received_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_order_status_timestamps ON orders;
CREATE TRIGGER trigger_order_status_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_timestamps();

-- Create view for order summary with all statuses
-- Note: For user details, you'll need to fetch them separately in your application
-- or create a Supabase Edge Function that has proper auth.users access
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.id,
  o.order_number,
  o.user_id,
  o.shop_id,
  o.status,
  o.payment_status,
  o.refund_status,
  o.delivery_status,
  o.fulfillment_status,
  o.total_amount,
  o.currency,
  o.tracking_number,
  o.delivery_date,
  o.stripe_payment_intent_id,
  o.created_at,
  o.updated_at,
  s.name as shop_name
FROM orders o
LEFT JOIN shops s ON o.shop_id = s.id;

-- Grant access to the view
GRANT SELECT ON order_summary TO authenticated;

-- Add sample data for testing (optional - remove in production)
-- UPDATE orders SET 
--   payment_status = 'completed',
--   stripe_session_id = 'cs_test_123',
--   stripe_payment_intent_id = 'pi_123',
--   status = 'shipped',
--   tracking_number = '1Z999AA10123456784',
--   estimated_delivery = NOW() + INTERVAL '5 days',
--   delivery_status = 'in_transit'
-- WHERE id = (SELECT id FROM orders LIMIT 1);
