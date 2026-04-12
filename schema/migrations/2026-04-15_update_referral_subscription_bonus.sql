-- Update referral system to credit $10 and 15 views when referred user subscribes
-- Date: 2026-04-15

-- ============================================================================
-- 1. UPDATE process_referral_subscription FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION process_referral_subscription(
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
  v_cash_bonus DECIMAL(10,2);
  v_views_bonus INTEGER;
BEGIN
  -- Get referral for this user
  SELECT * INTO v_referral FROM referrals WHERE referred_id = p_user_id AND status = 'signed_up';
  
  IF v_referral.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get bonuses from admin settings
  SELECT referral_cash_bonus, referral_views_bonus 
  INTO v_cash_bonus, v_views_bonus 
  FROM admin_settings LIMIT 1;
  
  -- Update referral status
  UPDATE referrals 
  SET status = 'subscribed', 
      cash_awarded = COALESCE(v_cash_bonus, 10),
      views_awarded = COALESCE(v_views_bonus, 15),
      subscribed_at = NOW()
  WHERE id = v_referral.id;
  
  -- Credit referrer with views
  UPDATE users 
  SET available_views = available_views + COALESCE(v_views_bonus, 15),
      updated_at = NOW()
  WHERE id = v_referral.referrer_id;
  
  -- Note: Cash bonus ($10) is tracked in referrals.cash_awarded
  -- Can be aggregated for payouts later via referral_payouts table
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
