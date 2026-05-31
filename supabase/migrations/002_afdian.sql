-- Add afdian fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS afdian_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_order_id TEXT;

-- Add unique constraint to prevent duplicate order activation
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_premium_order_id ON profiles(premium_order_id) WHERE premium_order_id IS NOT NULL;

-- Add index for afdian lookup
CREATE INDEX IF NOT EXISTS idx_profiles_afdian_user_id ON profiles(afdian_user_id) WHERE afdian_user_id IS NOT NULL;
