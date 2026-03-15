-- Agent Jobs table for multi-step agent dispatcher
-- Run this in Supabase SQL Editor after supabase-schema-v2.sql

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  agent_type text not null check (agent_type in ('ad_campaign', 'deep_research', 'content_calendar', 'congruence_audit', 'email_campaign')),
  config jsonb default '{}'::jsonb,
  status text default 'pending' check (status in ('pending', 'running', 'complete', 'failed')),
  progress jsonb default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.agent_jobs enable row level security;

create policy "Users can view own agent jobs"
  on public.agent_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own agent jobs"
  on public.agent_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agent jobs"
  on public.agent_jobs for update
  using (auth.uid() = user_id);

-- Service role needs to update jobs from API routes
-- The anon key user is the authenticated user, so the above policies cover it.
-- If using a service role key for the worker, you'd bypass RLS.

-- Index for polling
create index if not exists idx_agent_jobs_user_status on public.agent_jobs (user_id, status);
create index if not exists idx_agent_jobs_created on public.agent_jobs (created_at desc);
