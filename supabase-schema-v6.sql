-- Codify Platform Integrations Schema (v6)
-- Adds integrations support to user_profiles and publish logging to outputs

-- Store integration connections as JSONB array on user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb;

-- Store publish log as JSONB array on outputs
ALTER TABLE public.outputs ADD COLUMN IF NOT EXISTS publish_log jsonb DEFAULT '[]'::jsonb;
