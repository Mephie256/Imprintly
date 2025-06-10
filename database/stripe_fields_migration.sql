-- Add Stripe-related fields to the users table
-- Run this migration in your Supabase SQL editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update RLS policies to include new fields
-- Note: Make sure your existing RLS policies cover these new fields

-- Optional: Create a view for subscription information
CREATE OR REPLACE VIEW user_subscriptions AS
SELECT 
  id,
  clerk_user_id,
  email,
  first_name,
  last_name,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_current_period_start,
  subscription_current_period_end,
  usage_count,
  created_at,
  updated_at
FROM users
WHERE subscription_tier != 'free' OR stripe_customer_id IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON user_subscriptions TO authenticated;

COMMENT ON TABLE users IS 'Users table with Stripe integration fields';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status (active, canceled, past_due, etc.)';
COMMENT ON COLUMN users.subscription_current_period_start IS 'Current billing period start date';
COMMENT ON COLUMN users.subscription_current_period_end IS 'Current billing period end date';
