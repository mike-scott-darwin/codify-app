-- ============================================================================
-- Codify App — Schema v10: Agent Chains, Schedules, and Token Usage
-- ============================================================================

-- Agent chains (templates and user-owned)
CREATE TABLE IF NOT EXISTS agent_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT false,
  template_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_chains_user" ON agent_chains
  FOR ALL USING (auth.uid() = user_id OR is_template = true);

-- Chain steps
CREATE TABLE IF NOT EXISTS agent_chain_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID REFERENCES agent_chains(id) ON DELETE CASCADE NOT NULL,
  step_order INT NOT NULL,
  agent_type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  input_mapping JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (chain_id, step_order)
);

ALTER TABLE agent_chain_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_chain_steps_user" ON agent_chain_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agent_chains
      WHERE agent_chains.id = agent_chain_steps.chain_id
        AND (agent_chains.user_id = auth.uid() OR agent_chains.is_template = true)
    )
  );

-- Agent schedules
CREATE TABLE IF NOT EXISTS agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('single', 'chain')),
  cron_expression TEXT NOT NULL,
  agent_type TEXT,
  chain_id UUID REFERENCES agent_chains(id) ON DELETE SET NULL,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  max_runs INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_schedules_user" ON agent_schedules
  FOR ALL USING (auth.uid() = user_id);

-- Chain runs
CREATE TABLE IF NOT EXISTS agent_chain_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chain_id UUID REFERENCES agent_chains(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES agent_schedules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'failed', 'partial')),
  current_step INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT
);

ALTER TABLE agent_chain_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_chain_runs_user" ON agent_chain_runs
  FOR ALL USING (auth.uid() = user_id);

-- Chain run steps
CREATE TABLE IF NOT EXISTS agent_chain_run_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_run_id UUID REFERENCES agent_chain_runs(id) ON DELETE CASCADE NOT NULL,
  step_order INT NOT NULL,
  agent_job_id UUID,
  input_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_chain_run_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_chain_run_steps_user" ON agent_chain_run_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agent_chain_runs
      WHERE agent_chain_runs.id = agent_chain_run_steps.chain_run_id
        AND agent_chain_runs.user_id = auth.uid()
    )
  );

-- Token usage tracking
CREATE TABLE IF NOT EXISTS agent_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_job_id UUID,
  agent_type TEXT NOT NULL,
  tokens_input BIGINT DEFAULT 0,
  tokens_output BIGINT DEFAULT 0,
  tokens_total BIGINT DEFAULT 0,
  provider TEXT,
  model TEXT,
  cost_estimate_usd NUMERIC(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_token_usage_user" ON agent_token_usage
  FOR ALL USING (auth.uid() = user_id);

-- Budget settings
CREATE TABLE IF NOT EXISTS agent_budget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  monthly_token_cap BIGINT,
  monthly_cost_cap NUMERIC(10, 2),
  alert_threshold INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_budget_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_budget_settings_user" ON agent_budget_settings
  FOR ALL USING (auth.uid() = user_id);

-- Add columns to existing agent_jobs
ALTER TABLE agent_jobs ADD COLUMN IF NOT EXISTS chain_run_id UUID REFERENCES agent_chain_runs(id) ON DELETE SET NULL;
ALTER TABLE agent_jobs ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES agent_schedules(id) ON DELETE SET NULL;
ALTER TABLE agent_jobs ADD COLUMN IF NOT EXISTS tokens_used JSONB DEFAULT '{}';

-- ============================================================================
-- Template chains
-- ============================================================================

-- Template 1: Research to Publish
INSERT INTO agent_chains (id, user_id, name, description, is_template, template_key)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'Research to Publish',
  'Scout trending topics in your niche, generate social posts from findings, then format for publishing.',
  true,
  'research_to_publish'
) ON CONFLICT (template_key) DO NOTHING;

INSERT INTO agent_chain_steps (chain_id, step_order, agent_type, config, input_mapping) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'research_scout', '{}', '{}'),
  ('a0000000-0000-0000-0000-000000000001', 2, 'social_post_generator', '{}', '{"research_findings": "previous_output"}'),
  ('a0000000-0000-0000-0000-000000000001', 3, 'publisher', '{}', '{"content": "previous_output"}')
ON CONFLICT (chain_id, step_order) DO NOTHING;

-- Template 2: Weekly Audit
INSERT INTO agent_chains (id, user_id, name, description, is_template, template_key)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  'Weekly Audit',
  'Automated reference file health check — completeness, staleness, and consistency scores.',
  true,
  'weekly_audit'
) ON CONFLICT (template_key) DO NOTHING;

INSERT INTO agent_chain_steps (chain_id, step_order, agent_type, config, input_mapping) VALUES
  ('a0000000-0000-0000-0000-000000000002', 1, 'audit_agent', '{}', '{}')
ON CONFLICT (chain_id, step_order) DO NOTHING;

-- Template 3: Trend to Social
INSERT INTO agent_chains (id, user_id, name, description, is_template, template_key)
VALUES (
  'a0000000-0000-0000-0000-000000000003',
  NULL,
  'Trend to Social',
  'Monitor trending topics relevant to your audience, then generate ready-to-post social content.',
  true,
  'trend_to_social'
) ON CONFLICT (template_key) DO NOTHING;

INSERT INTO agent_chain_steps (chain_id, step_order, agent_type, config, input_mapping) VALUES
  ('a0000000-0000-0000-0000-000000000003', 1, 'trend_monitor', '{}', '{}'),
  ('a0000000-0000-0000-0000-000000000003', 2, 'social_post_generator', '{}', '{"trends": "previous_output"}')
ON CONFLICT (chain_id, step_order) DO NOTHING;
