-- Add unique username/slug to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate default slugs for existing users
UPDATE profiles SET slug = 'user-' || substring(id::text, 1, 8) WHERE slug IS NULL;

-- Create function to generate slug for new profiles
CREATE OR REPLACE FUNCTION set_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := 'user-' || substring(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS trg_set_profile_slug ON profiles;
CREATE TRIGGER trg_set_profile_slug
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_profile_slug();

-- User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON user_follows FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = follower_id)
);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM profiles WHERE id = follower_id)
);

-- Dark mode preference
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;
