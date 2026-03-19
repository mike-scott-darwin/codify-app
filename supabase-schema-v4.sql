-- Migration v4: Rename VIP tier to Agency
-- Run after v3 (agent_jobs table)

-- Step 1: Update existing users from 'vip' to 'agency'
UPDATE user_profiles SET tier = 'agency' WHERE tier = 'vip';

-- Step 2: Drop the old CHECK constraint and add new one
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_tier_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_tier_check
  CHECK (tier IN ('free', 'build', 'pro', 'agency'));
