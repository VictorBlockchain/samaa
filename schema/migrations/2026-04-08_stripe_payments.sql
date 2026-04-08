-- Migration: Stripe Payment Integration
-- Description: Adds support for subscriptions, likes purchases, and payment tracking

-- Add available_likes column to users table
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS available_likes INTEGER DEFAULT 0 CHECK (available_likes >= 0);

-- Add subscription status to users table for quick access
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium_monthly', 'premium_yearly')),
    ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('premium_monthly', 'premium_yearly')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

-- Create user_payments table for likes and subscription payments
CREATE TABLE IF NOT EXISTS user_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    type TEXT NOT NULL CHECK (type IN ('subscription', 'likes', 'product')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_status ON user_payments(status);
CREATE INDEX IF NOT EXISTS idx_user_payments_type ON user_payments(type);
CREATE INDEX IF NOT EXISTS idx_user_payments_created_at ON user_payments(created_at DESC);

-- Create a function to add likes to a user
CREATE OR REPLACE FUNCTION add_likes(
    p_user_id UUID,
    p_likes INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET available_likes = available_likes + p_likes,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to use likes
CREATE OR REPLACE FUNCTION use_like(
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_likes INTEGER;
BEGIN
    SELECT available_likes INTO current_likes FROM users WHERE id = p_user_id;
    
    IF current_likes > 0 THEN
        UPDATE users
        SET available_likes = available_likes - 1,
            updated_at = NOW()
        WHERE id = p_user_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_payments_updated_at
    BEFORE UPDATE ON user_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for user payment summary
CREATE OR REPLACE VIEW user_payment_summary AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE type = 'likes') as likes_purchases,
    COUNT(*) FILTER (WHERE type = 'subscription') as subscription_payments,
    SUM(amount) FILTER (WHERE status = 'succeeded') as total_spent,
    MAX(created_at) as last_payment_date
FROM user_payments
GROUP BY user_id;

-- Row Level Security Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid()::text = user_id::text OR EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_id AND email = auth.email()
    ));

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON user_payments FOR SELECT
    USING (auth.uid()::text = user_id::text OR EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_id AND email = auth.email()
    ));

-- Service role can manage all subscriptions and payments
CREATE POLICY "Service role full access on subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on user_payments"
    ON user_payments FOR ALL
    USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON user_payments TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores user subscription information for premium features';
COMMENT ON TABLE user_payments IS 'Tracks all user payments including likes purchases and subscriptions';
COMMENT ON COLUMN users.available_likes IS 'Number of likes available for the user to send';
COMMENT ON FUNCTION add_likes IS 'Adds likes to a user account';
COMMENT ON FUNCTION use_like IS 'Deducts one like from user account if available';
