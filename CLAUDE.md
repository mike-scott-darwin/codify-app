# Codify App

SaaS platform that transforms business knowledge into AI-powered content through a compounding loop.

## The Loop

Build reference files -> Research topics -> Decide -> Codify insights back into reference -> Generate content -> Publish to platforms.

Each cycle compounds — better reference = better output.

## Tech Stack

- **Framework:** Next.js 16 App Router (`"use client"` pattern)
- **Auth:** Supabase Auth (email OTP) + PostgreSQL with Row Level Security
- **LLM:** Unified `callLLM()` abstraction supporting Gemini (default), OpenAI, Anthropic, Ollama
- **File Storage:** GitHub REST API (PAT-based, read/write to user's repo via @octokit/rest)
- **Styling:** Tailwind CSS v4, dark terminal aesthetic (#0a0a0a bg, #22c55e green, #4a9eff blue, #8b5cf6 purple, mono font)
- **Output Rendering:** react-markdown with styled components, rich clipboard copy (ClipboardItem text/html for Google Docs/Word paste)

## Architecture

```
src/
  app/
    api/
      agent/         # dispatch/, status/, run/ — Supabase job queue for async agents
      enrich/         # AI enrichment of reference files
      generate/       # Content generation endpoint
      github/         # config/, files/, init/ — GitHub repo integration
      integrations/   # CRUD + publish to GHL, Postiz, Buffer, Mailchimp, Webhooks
      outputs/        # Output history CRUD
      reference/      # save/, enhance/ — codify + file upload merge
      research/       # CRUD + [id]/ai/ + [id]/codify/
      terminal/       # In-browser CLI with slash commands
      user/           # tier/ — returns user tier (defaults to "vip" until Stripe)
    dashboard/
      agents/         # Agent hub + [id] detail (campaign mode)
      files/          # Reference files hub (Build step)
      generate/       # Content generation (Create step)
      help/           # FAQ accordion
      outputs/        # Output history (Publish step)
      research/       # Research workspace + [id] detail with codify flow
      settings/       # Account, Usage, AI Provider, GitHub, Integrations
      terminal/       # In-browser CLI
      upgrade/        # Tier upgrade page
  lib/
    agents/           # Agent types, gemini helper
    integrations/     # Platform types + publish dispatcher
    llm/
      provider.ts     # callLLM() — unified LLM abstraction (Gemini/OpenAI/Anthropic/Ollama)
      user-config.ts  # getUserLLMConfig() from user_profiles.llm_config
    tier.ts           # Tier system: Free/Build($99)/Pro($199)/VIP($497)
    generation-types.ts   # 6 output types: ad_copy, social_post, email_sequence, vsl_script, landing_page, newsletter
    generation-prompts.ts # Prompt templates per output type
    github.ts         # GitHub API client (readFile, writeFile, listFiles, verifyRepo, initStructure)
    supabase.ts       # Browser Supabase client
    supabase-server.ts    # Server Supabase client (cookies-based)
```

## Sidebar = Process Steps

The sidebar IS the process. Numbered steps:
1. **Build** — reference files (soul, offer, audience, voice)
2. **Research** — explore topics, ask AI, add findings
3. **Create** — generate content from reference
4. **Publish** — output history, platform publishing
5. **Automate** — agents (ad campaign, content calendar, email campaign)

Plus: Terminal, Help, Settings.

## Tier System

All tiers default to VIP until Stripe is wired. The tier check in API routes uses `profile?.tier || "vip"`. If you see `|| "free"` anywhere in an API route, that's a bug — change it to `"vip"`.

Tiers: free -> build ($99) -> pro ($199) -> vip ($497).

## Key Patterns

- **Supabase as job queue:** Agent dispatch creates a row in `agent_jobs`, fire-and-forget worker processes it
- **GitHub as file store:** Reference files sync to user's GitHub repo (PAT auth). Falls back to Supabase `interview_answers` table
- **Codify flow:** Research decision -> LLM generates proposed reference file updates -> user reviews side-by-side diff -> applies per-file
- **BYOLLM:** Users configure provider/key/model in Settings. `getUserLLMConfig()` loads from `user_profiles.llm_config`, `callLLM()` dispatches to the right provider

## Supabase Tables

- `user_profiles` — tier, llm_config, github_config, integrations
- `interview_answers` — reference file content (file_type + enriched_content)
- `research_topics` — title, status, content, findings, decision, codify_proposals
- `agent_jobs` — agent_type, status, result, user_id
- `generation_outputs` — type, content, options, user_id
- `publish_log` — integration_id, output_id, platform, status

SQL migrations: `supabase-schema.sql` through `supabase-schema-v7.sql` (run in order in Supabase SQL Editor).

## Common Issues

- `/tmp/` gets cleared on reboot. Always push to GitHub before ending session.
- API routes returning 403? Check tier default is `"vip"` not `"free"`.
- Agent stuck on "Launching"? Check dispatch route tier default + error display in UI.
- Research AI failing silently? Error state was added — look for the red error banner.
- File writes via Python heredocs corrupt JSX unicode escapes. Use `node -e` for JSX-heavy files.

## Git Convention

`[type] Brief description` — types: `[add]`, `[update]`, `[fix]`, `[remove]`, `[refactor]`

## Dev Commands

```bash
cd /tmp/codify-app
npm run dev        # localhost:3000
npm run build      # production build check
git push           # pushes to mike-scott-darwin/codify-app
```
