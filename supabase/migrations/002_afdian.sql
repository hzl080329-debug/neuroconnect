-- Track premium payment orders to prevent double-activation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_order_id TEXT;
