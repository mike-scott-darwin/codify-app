# Codify App

SaaS platform that transforms business knowledge into AI-powered content through a compounding loop.

## The Loop

Build reference files → Research topics → Decide → Codify insights back into reference → Generate content → Score & improve → Publish to platforms → Repeat.

Each cycle compounds — better reference = better output.

## Tech Stack

- **Framework:** Next.js 16 App Router (`"use client"` pattern)
- **Auth:** Supabase Auth (email OTP) + PostgreSQL with Row Level Security
- **GitHub Auth:** GitHub OAuth App (repo scope) — user clicks "Connect with GitHub", no PATs
- **LLM:** Unified `callLLM()` abstraction supporting Gemini (default), OpenAI, Anthropic, Ollama
- **File Storage:** GitHub REST API as source of truth. Supabase `interview_answers` is a cache/index only.
- **State Management:** `RepoContext` — React context wrapping all dashboard pages, loads files from GitHub on mount
- **Styling:** Tailwind CSS v4, dark terminal aesthetic (#0a0a0a bg, #22c55e green, #4a9eff blue, #8b5cf6 purple, mono font)
- **Output Rendering:** react-markdown with styled components, rich clipboard copy (ClipboardItem text/html for Google Docs/Word paste)

## Architecture

```
src/
  app/
    api/
      agent/           # dispatch/, status/, run/ — Supabase job queue for async agents
      auth/github/      # OAuth initiation + callback (exchanges code for token)
      enrich/           # AI enrichment of reference files
      generate/         # Content generation endpoint
      github/           # config/, files/, init/, create-repo/ — GitHub repo integration
      integrations/     # CRUD + publish to GHL, Postiz, Buffer, Mailchimp, Webhooks
      outputs/          # Output history CRUD + calendar/ endpoint
      reference/        # save/, enhance/ — codify + file upload merge
      research/         # CRUD + [id]/ai/ + [id]/codify/
      score/            # Predictive performance scoring
      terminal/         # In-browser CLI with slash commands
      user/             # tier/, llm-config/
    onboarding/         # 4-step wizard: Connect GitHub → Name workspace → Interview → Ready
    dashboard/
      agents/           # Agent hub + [id] detail (campaign mode)
      calendar/         # Content calendar with drag-and-drop scheduling
      files/            # Reference files hub (Build step)
      generate/         # Content generation (Create step) with auto-scoring
      help/             # FAQ accordion
      outputs/          # Output history (Publish step)
      research/         # Research workspace + [id] detail with codify flow
      settings/         # Account, Usage, AI Provider, GitHub, Integrations
      terminal/         # In-browser CLI
      upgrade/          # Tier upgrade page
  lib/
    agents/             # Agent types, gemini helper, runner
    integrations/       # Platform types + publish dispatcher
    llm/
      provider.ts       # callLLM() — unified LLM abstraction
      user-config.ts    # getUserLLMConfig() from user_profiles.llm_config
    repo-context.tsx    # RepoProvider + useRepo() — GitHub-first state
    file-builders.ts    # buildContent() — converts interview answers to markdown
    tier.ts             # Tier system: Free/Build/Pro/VIP
    tier-context.tsx    # TierProvider + useTier()
    output-constants.ts # Shared TYPE_LABELS, TYPE_COLORS, STATUS_COLORS
    score-types.ts      # Scoring dimensions, weights per content type
    score-prompt.ts     # LLM prompt for predictive performance scoring
    generation-types.ts # 6 output types
    generation-prompts.ts # Prompt templates per output type
    github.ts           # GitHub API client
    supabase.ts         # Browser Supabase client
    supabase-server.ts  # Server Supabase client
```

## Data Flow: GitHub-First

```
Onboarding:
  GitHub OAuth → token saved to user_profiles.github_config
  → auto-create private repo → scaffold folders
  → interview answers → buildContent() → commit to GitHub

Dashboard (every page load):
  RepoContext mounts → fetches /api/github/files for all 4 core files
  → caches in React state → all pages read from useRepo()

File writes:
  Edit/codify/enrich → POST /api/github/files → commit to repo
  → RepoContext.refreshFiles() → UI updates

Scoring:
  Generate content → POST /api/score with content + reference context
  → LLM scores on 5 dimensions → cached on output record
```

## Onboarding Flow

4 steps — no technical jargon, business-first language:
1. **"Let's build your business brain"** — Connect with GitHub (OAuth, one click)
2. **"Name your workspace"** — text input, auto-creates private repo + scaffolds structure
3. **"Tell us about your business"** — conversational interview (soul → offer → audience → voice), files commit silently
4. **"Your business brain is ready"** — file status grid, enter dashboard

Users who haven't connected GitHub are redirected from /dashboard to /onboarding.

## Sidebar = Process Steps (Progressive Unlock)

The sidebar IS the process. Items unlock based on file completeness:

| Step | Label | Unlock Condition |
|------|-------|-----------------|
| — | Dashboard | Always |
| 1 | Build | Always |
| 2 | Research | 2+ core files with content |
| 3 | Create | All 4 core files with content |
| 4 | Publish | Always (empty state) |
| 5 | Calendar | All 4 core files + tier |
| 6 | Automate | All 4 core files + tier |
| — | Terminal | Always |
| — | Help | Always |
| — | Settings | Always |

Mini progress bar at top: "Core files N/4"

## Predictive Performance Scoring

Every generated output gets scored on 5 dimensions (0-100):
- Hook Strength, Voice Alignment, CTA Clarity, Audience Match, Emotional Resonance
- Weights vary by content type (ads weight hooks/CTA, newsletters weight voice/audience)
- Score card with color-coded bar, improvement suggestions
- Cached on the output record for repeat views

## Content Calendar

Month view with drag-and-drop scheduling:
- Drag unscheduled outputs from sidebar panel onto calendar days
- Color-coded pills by content type with status dots (draft/scheduled/published/failed)
- Day modal for details, status changes, and creating new content

## Tier System

All tiers default to VIP until Stripe is wired. The tier check in API routes uses `profile?.tier || "vip"`. If you see `|| "free"` anywhere in an API route, that's a bug — change it to `"vip"`.

Tiers: free → build () → pro () → vip ().

## Key Patterns

- **GitHub-first:** RepoContext loads files from GitHub on mount. All writes commit to GitHub. Supabase interview_answers is a background cache.
- **Progressive unlock:** Sidebar items gate on file completeness (useRepo().fileCompleteness) AND tier (useTier()).
- **Supabase as job queue:** Agent dispatch creates a row in agent_jobs, fire-and-forget worker processes it.
- **Codify flow:** Research decision → LLM generates proposed updates → user reviews diff → applies per-file.
- **BYOLLM:** Users configure provider/key/model in Settings. callLLM() dispatches to the right provider.
- **Scoring loop:** Generated content → LLM scores against reference files → suggestions feed back into research.

## Supabase Tables

- user_profiles — tier, llm_config, github_config, integrations
- interview_answers — reference file content cache (file_type + enriched_content)
- research_topics — title, status, content, findings, decision, codify_proposals
- agent_jobs — agent_type, status, result, user_id
- generation_outputs — type, content, options, score_data, scheduled_date, schedule_status
- publish_log — integration_id, output_id, platform, status

SQL migrations: supabase-schema.sql through supabase-schema-v9.sql (run in order in Supabase SQL Editor).

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# GitHub OAuth App (register at github.com/settings/developers)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Default LLM (Gemini)
GEMINI_API_KEY=xxx
```

## Common Issues

- API routes returning 403? Check tier default is "vip" not "free".
- Agent stuck on "Launching"? Check dispatch route tier default + error display in UI.
- Research AI failing silently? Error state added — look for the red error banner.
- File writes via Python heredocs corrupt JSX unicode escapes. Use node -e for JSX-heavy files.
- Build errors from agents/[id]/page.tsx importing server modules? Pre-existing — doesn't affect other pages.

## Git Convention

`[type] Brief description` — types: [add], [update], [fix], [remove], [refactor]

## Dev Commands

```bash
cd ~/Documents/GitHub/codify-app   # canonical working directory
npm run dev        # localhost:3000
npm run build      # production build check
git push           # pushes to mike-scott-darwin/codify-app
```
