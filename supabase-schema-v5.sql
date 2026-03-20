-- Migration v5: Pending upgrades table for GHL webhook
-- Handles case where someone pays before creating an app account

CREATE TABLE IF NOT EXISTS pending_upgrades (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  tier text not null check (tier in ('build', 'pro', 'agency')),
  ghl_product_id text,
  payload jsonb,
  applied boolean default false,
  created_at timestamptz default now(),
  applied_at timestamptz
);

-- Index for quick lookup on signup
CREATE INDEX IF NOT EXISTS idx_pending_upgrades_email ON pending_upgrades(email) WHERE applied = false;

-- Function to auto-apply pending upgrades when a user signs up
CREATE OR REPLACE FUNCTION apply_pending_upgrade()
RETURNS trigger AS $$
DECLARE
  pending record;
  user_email text;
BEGIN
  -- Get email from the new user profile's auth record
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  
  IF user_email IS NOT NULL THEN
    SELECT * INTO pending FROM pending_upgrades
    WHERE email = lower(user_email) AND applied = false
    LIMIT 1;
    
    IF FOUND THEN
      NEW.tier := pending.tier;
      UPDATE pending_upgrades
      SET applied = true, applied_at = now()
      WHERE id = pending.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_profiles insert
DROP TRIGGER IF EXISTS trg_apply_pending_upgrade ON user_profiles;
CREATE TRIGGER trg_apply_pending_upgrade
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION apply_pending_upgrade();
