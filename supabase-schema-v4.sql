-- Add LLM config column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS llm_config jsonb DEFAULT '{"provider": "gemini"}'::jsonb;
