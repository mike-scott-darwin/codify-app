-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Interview answers — one row per user per file type
create table if not exists interview_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_type text not null check (file_type in ('soul', 'offer', 'audience', 'voice')),
  answers jsonb not null default '{}',
  enriched_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, file_type)
);

-- Enrichment usage log — tracks free tier usage
create table if not exists enrichment_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_type text not null,
  created_at timestamptz default now()
);

-- User API keys — encrypted BYOK keys
create table if not exists user_api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('anthropic', 'openai', 'google')),
  api_key text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

-- Row Level Security
alter table interview_answers enable row level security;
alter table enrichment_log enable row level security;
alter table user_api_keys enable row level security;

-- Policies: users can only access their own data
create policy "Users read own answers"
  on interview_answers for select
  using (auth.uid() = user_id);

create policy "Users insert own answers"
  on interview_answers for insert
  with check (auth.uid() = user_id);

create policy "Users update own answers"
  on interview_answers for update
  using (auth.uid() = user_id);

create policy "Users read own enrichment log"
  on enrichment_log for select
  using (auth.uid() = user_id);

create policy "Users insert own enrichment log"
  on enrichment_log for insert
  with check (auth.uid() = user_id);

create policy "Users manage own api keys"
  on user_api_keys for all
  using (auth.uid() = user_id);
