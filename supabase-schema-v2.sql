-- Codify Dashboard Schema v2 (additive — run after v1)

-- User profiles with tier
create table if not exists user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  tier text not null default 'free' check (tier in ('free', 'build', 'pro', 'vip')),
  display_name text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = user_id);

-- Generated outputs
create table if not exists outputs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  output_type text not null check (output_type in ('ad_copy', 'social_post', 'email_sequence', 'vsl_script', 'landing_page')),
  title text not null,
  prompt_config jsonb not null default '{}',
  content text not null,
  reference_snapshot jsonb,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

alter table outputs enable row level security;
create policy "Users can view own outputs" on outputs for select using (auth.uid() = user_id);
create policy "Users can insert own outputs" on outputs for insert with check (auth.uid() = user_id);
create policy "Users can update own outputs" on outputs for update using (auth.uid() = user_id);
create policy "Users can delete own outputs" on outputs for delete using (auth.uid() = user_id);

-- Generation usage tracking
create table if not exists generation_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  output_type text not null,
  created_at timestamptz default now()
);

alter table generation_log enable row level security;
create policy "Users can view own generation log" on generation_log for select using (auth.uid() = user_id);
create policy "Users can insert own generation log" on generation_log for insert with check (auth.uid() = user_id);

-- Research topics (Build tier+)
create table if not exists research_topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  status text not null default 'research' check (status in ('research', 'deciding', 'decided', 'codified')),
  content text default '',
  findings jsonb default '[]',
  decision text,
  linked_files text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table research_topics enable row level security;
create policy "Users can view own research" on research_topics for select using (auth.uid() = user_id);
create policy "Users can insert own research" on research_topics for insert with check (auth.uid() = user_id);
create policy "Users can update own research" on research_topics for update using (auth.uid() = user_id);
create policy "Users can delete own research" on research_topics for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, tier)
  values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Only create trigger if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function handle_new_user();
  end if;
end
$$;
