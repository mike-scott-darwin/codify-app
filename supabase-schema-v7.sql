-- v7: Add GitHub repository integration config to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS github_config jsonb DEFAULT NULL;

-- github_config stores: { token, owner, repo, branch }
-- Token is stored encrypted at rest by Supabase
COMMENT ON COLUMN public.user_profiles.github_config IS 'GitHub repo config: {token, owner, repo, branch}';
