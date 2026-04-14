-- Vault file cache — stores synced GitHub content for fast reads
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

create table if not exists vault_files (
  id          bigint generated always as identity primary key,
  repo        text not null,                    -- e.g. "owner/repo"
  path        text not null,                    -- full file path
  name        text not null,                    -- filename only
  file_type   text not null default 'file',     -- "file" or "dir"
  content     text,                             -- markdown body (no frontmatter)
  frontmatter jsonb,                            -- parsed YAML frontmatter
  sha         text not null default '',         -- git SHA for change detection
  parent_dir  text not null default '',         -- parent directory path
  word_count  int not null default 0,           -- for context depth
  links_to    text[] not null default '{}',     -- paths this file links to
  synced_at   timestamptz not null default now()
);

-- Unique constraint: one entry per file per repo
create unique index if not exists vault_files_repo_path on vault_files (repo, path);

-- Fast lookups by parent directory (listing folders)
create index if not exists vault_files_parent on vault_files (repo, parent_dir);

-- Fast backlink search (find files that link to a target)
create index if not exists vault_files_links on vault_files using gin (links_to);

-- Fast content search (for unlinked mentions)
create index if not exists vault_files_content_search on vault_files using gin (to_tsvector('english', coalesce(content, '')));

-- RLS: service role only (no direct client access)
alter table vault_files enable row level security;

-- Allow service role full access (used by API routes via supabase-admin)
create policy "Service role full access" on vault_files
  for all
  using (true)
  with check (true);
