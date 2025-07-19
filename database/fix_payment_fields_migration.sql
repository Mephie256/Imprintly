-- 🔧 FIX PAYMENT FIELDS MIGRATION
-- This migration fixes all inconsistent field names for Stripe integration
-- Run this in your Supabase SQL Editor to fix payment errors

-- Step 1: Ensure all required Stripe fields exist with consistent names
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Step 2: Drop old inconsistent field names if they exist
ALTER TABLE users DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE users DROP COLUMN IF EXISTS plan_type;

-- Step 3: Ensure subscription_tier uses the correct enum values
-- Update any existing data to use consistent values
UPDATE users 
SET subscription_tier = 'monthly' 
WHERE subscription_tier = 'pro' OR subscription_tier = 'premium';

UPDATE users 
SET subscription_tier = 'free' 
WHERE subscription_tier NOT IN ('free', 'monthly', 'yearly');

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Step 5: Add constraints to ensure data integrity
ALTER TABLE users 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'inactive'));

-- Step 6: Create a function to sync user subscription data
CREATE OR REPLACE FUNCTION sync_user_subscription(
  p_clerk_user_id TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL,
  p_subscription_status TEXT DEFAULT 'inactive',
  p_subscription_tier TEXT DEFAULT 'free',
  p_current_period_start TIMESTAMPTZ DEFAULT NULL,
  p_current_period_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  clerk_user_id TEXT,
  email TEXT,
  subscription_tier subscription_tier,
  subscription_status TEXT,
  stripe_customer_id TEXT,
  subscription_id TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user subscription data
  INSERT INTO users (
    clerk_user_id,
    email,
    stripe_customer_id,
    subscription_id,
    subscription_status,
    subscription_tier,
    subscription_current_period_start,
    subscription_current_period_end,
    usage_count,
    preferences,
    created_at,
    updated_at
  ) VALUES (
    p_clerk_user_id,
    COALESCE((SELECT email FROM users WHERE clerk_user_id = p_clerk_user_id), 'unknown@example.com'),
    p_stripe_customer_id,
    p_subscription_id,
    p_subscription_status,
    p_subscription_tier::subscription_tier,
    p_current_period_start,
    p_current_period_end,
    0,
    '{}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (clerk_user_id) 
  DO UPDATE SET
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, users.stripe_customer_id),
    subscription_id = COALESCE(EXCLUDED.subscription_id, users.subscription_id),
    subscription_status = EXCLUDED.subscription_status,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_current_period_start = EXCLUDED.subscription_current_period_start,
    subscription_current_period_end = EXCLUDED.subscription_current_period_end,
    updated_at = NOW();

  -- Return the updated user data
  RETURN QUERY
  SELECT 
    u.id,
    u.clerk_user_id,
    u.email,
    u.subscription_tier,
    u.subscription_status,
    u.stripe_customer_id,
    u.subscription_id
  FROM users u
  WHERE u.clerk_user_id = p_clerk_user_id;
END;
$$;

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_subscription TO service_role;

-- Step 8: Create a view for easy subscription queries
CREATE OR REPLACE VIEW user_subscription_details AS
SELECT 
  u.id,
  u.clerk_user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.full_name,
  u.subscription_tier,
  u.subscription_status,
  u.stripe_customer_id,
  u.subscription_id,
  u.subscription_current_period_start,
  u.subscription_current_period_end,
  u.usage_count,
  u.created_at,
  u.updated_at,
  CASE 
    WHEN u.subscription_tier = 'free' THEN 3
    WHEN u.subscription_tier = 'monthly' THEN 999999
    WHEN u.subscription_tier = 'yearly' THEN 999999
    ELSE 3
  END as usage_limit,
  CASE 
    WHEN u.subscription_tier IN ('monthly', 'yearly') AND u.subscription_status = 'active' THEN true
    ELSE false
  END as has_premium_access
FROM users u;

-- Grant access to the view
GRANT SELECT ON user_subscription_details TO authenticated;
GRANT SELECT ON user_subscription_details TO service_role;

-- Step 9: Add helpful comments
COMMENT ON TABLE users IS 'Users table with consistent Stripe integration fields';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN users.subscription_id IS 'Active Stripe subscription ID (consistent naming)';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN users.subscription_tier IS 'Subscription tier: free, monthly, yearly';
COMMENT ON COLUMN users.subscription_current_period_start IS 'Current billing period start';
COMMENT ON COLUMN users.subscription_current_period_end IS 'Current billing period end';

-- Step 10: Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Payment fields migration completed successfully!';
    RAISE NOTICE '✅ All field names are now consistent';
    RAISE NOTICE '✅ Indexes and constraints added';
    RAISE NOTICE '✅ Helper functions and views created';
    RAISE NOTICE '🎉 Payment errors should now be resolved!';
END $$;
