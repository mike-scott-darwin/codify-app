# Codify App

SaaS platform that transforms business knowledge into AI-powered content through a compounding loop.

## The Loop

Build reference files → Research topics → Queue ideas → Decide → Codify insights back into reference → Generate content → Score & improve → Publish to platforms → Repeat.

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
- **Scheduling:** Vercel Cron (5-min interval) for agent chains
- **M1 Bridge:** OpenClaw + Telegram for phone-based content approval
- **Deployment:** Vercel at codify.build

## Architecture

```
src/
  app/
    api/
      agent/              # dispatch/, status/, run/, schedules/, chains/, chains/[id]/, usage/
      auth/github/        # OAuth initiation + callback (exchanges code for token)
      content-queue/      # CRUD + [id]/ + [id]/repurpose/ + from-research/
      cron/               # schedules/ — Vercel cron trigger (every 5 min)
      enrich/             # AI enrichment of reference files
      generate/           # Content generation endpoint
      github/             # config/, files/, init/, create-repo/ — GitHub repo integration
      integrations/       # CRUD + publish + test
      openclaw/           # queue/ — M1 bridge (API key auth, machine-to-machine)
      outputs/            # Output history CRUD + calendar/ endpoint
      reference/          # save/, enhance/ — codify + file upload merge
      research/           # CRUD + [id]/ai/ + [id]/codify/
      score/              # Predictive performance scoring
      terminal/           # In-browser CLI with slash commands
      user/               # tier/, llm-config/
    onboarding/           # 4-step wizard: Connect GitHub → Name workspace → Interview → Ready
    dashboard/
      agents/             # Agent hub + [id] detail + schedules/ + chains/ + usage/
      calendar/           # Content calendar with drag-and-drop scheduling
      files/              # Reference files hub (Build step)
      generate/           # Content generation (Create step) with auto-scoring
      help/               # FAQ accordion
      outputs/            # Output history (Publish step)
      queue/              # Content queue — approval pipeline
      research/           # Research workspace + [id] detail with codify flow
      settings/           # Account, Usage, AI Provider, GitHub, Integrations
      terminal/           # In-browser CLI
      upgrade/            # Tier upgrade page
  lib/
    agents/
      types.ts            # AgentType (10 types), AgentJob, AgentContext, AgentResult, AGENT_CONFIGS
      runner.ts           # Main runner — dispatches to correct agent, advances chains
      gemini.ts           # Shared LLM call helper with step logging
      chain-runner.ts     # executeChain(), advanceChain() for sequential step execution
      ad-campaign.ts      # 5-step: angles → hooks → copy → compliance → ranking
      deep-research.ts    # 5-step: questions → answers → synthesize → recommend
      content-calendar.ts # 5-step: pillars → days → posts → summary
      congruence-audit.ts # 4-step: check soul↔offer, audience↔voice, cross-alignment
      email-campaign.ts   # 5-step: arc → subjects → emails → timing
      research-scout.ts   # 3-step: scan niche → score → angles (also feeds content_queue)
      trend-monitor.ts    # 2-step: find trends → content angles (also feeds content_queue)
      social-post-generator.ts # 3-step: analyze voice → generate → format
      publisher-agent.ts  # 2-step: platform-specific formatting
      audit-agent.ts      # 4-step: inventory → completeness → consistency → health report
    integrations/         # Platform types + publish dispatcher
    llm/
      provider.ts         # callLLM() — unified LLM abstraction (Gemini, OpenAI, Anthropic, Ollama)
      user-config.ts      # getUserLLMConfig() from user_profiles.llm_config
    repo-context.tsx      # RepoProvider + useRepo() — GitHub-first state
    file-builders.ts      # buildContent() — converts interview answers to markdown
    tier.ts               # Tier system: Free/Build/Pro/VIP with feature gating
    tier-context.tsx      # TierProvider + useTier()
    output-constants.ts   # Shared TYPE_LABELS, TYPE_COLORS, STATUS_COLORS
    score-types.ts        # Scoring dimensions, weights per content type
    score-prompt.ts       # LLM prompt for predictive performance scoring
    generation-types.ts   # 6 output types: ad_copy, social_post, email_sequence, vsl_script, landing_page, newsletter
    generation-prompts.ts # Prompt templates per output type
    github.ts             # GitHub API client (Octokit wrapper)
    supabase.ts           # Browser Supabase client
    supabase-server.ts    # Server Supabase client
  components/
    dashboard/
      sidebar.tsx         # Main nav — progressive unlock + tier gating
      score-card.tsx      # 5-dimension score display
      tier-badge.tsx      # Tier indicator component
      upgrade-prompt.tsx  # Tier upgrade modal
    ui/                   # shadcn components (button, card, input, etc.)
  openclaw-skill/         # M1 bridge: codify-queue.js + OPENCLAW-INSTRUCTIONS.md
```

## Data Flow: GitHub-First

```
Onboarding:
  GitHub OAuth → token saved to user_profiles.github_config
  → auto-create private repo → scaffold folders + file tree visualization
  → interview answers (with file upload option) → buildContent() → commit to GitHub

Dashboard (every page load):
  RepoContext mounts → fetches /api/github/files for all 4 core files
  → caches in React state → all pages read from useRepo()

File writes:
  Edit/codify/enrich → POST /api/github/files → commit to repo
  → RepoContext.refreshFiles() → UI updates

Content Queue:
  Sources (research_scout, trend_monitor, manual, research, openclaw)
  → content_queue table → approve/reject (dashboard or Telegram)
  → repurpose to any format → outputs table

Scoring:
  Generate content → POST /api/score with content + reference context
  → LLM scores on 5 dimensions → cached on output record

Agent Chains:
  Vercel cron (5 min) → checks agent_schedules → dispatches jobs or chains
  → chain-runner executes steps sequentially with input_mapping
  → results → content_queue and/or outputs → token usage tracked
```

## Onboarding Flow

4 steps — no technical jargon, business-first language:
1. **"Let's build your business brain"** — Connect with GitHub (OAuth, one click)
2. **"Name your workspace"** — text input, auto-creates private repo + scaffolds structure, shows animated file tree (soul.md, offer.md, audience.md, voice.md)
3. **"Tell us about your business"** — conversational interview (soul → offer → audience → voice) with file upload option per question, files commit silently
4. **"Your business brain is ready"** — file status grid, enter dashboard

Users who haven't connected GitHub are redirected from /dashboard to /onboarding.

## Sidebar = Process Steps (Progressive Unlock)

The sidebar IS the process. Items unlock based on file completeness + tier:

| Step | Label | Unlock Condition |
|------|-------|-----------------|
| — | Dashboard | Always |
| 1 | Build | 1+ core file |
| 2 | Research | 2+ core files, build+ |
| 3 | Queue | 2+ core files, build+ |
| 4 | Create | All 4 core files, pro+ |
| 5 | Publish | pro+ |
| 6 | Calendar | All 4 core files, pro+ |
| 7 | Automate | All 4 core files, build+ |
| — | Terminal | Always |
| — | Help | Always |
| — | Settings | Always |

Mini progress bar at top: "Core files N/4"

## Agent System (10 Agents)

| Agent | Steps | Tier | Purpose |
|-------|-------|------|---------|
| congruence_audit | 4 | Build | Check alignment across reference files |
| deep_research | 5 | Build | Multi-angle research on any topic |
| ad_campaign | 5 | Pro | Full campaign: angles, hooks, copy, compliance, ranking |
| content_calendar | 5 | Pro | Weekly content planning with platform assignments |
| email_campaign | 5 | Pro | Sequence with arc planning, subject lines, timing |
| research_scout | 3 | Pro | Trending topics + relevance scoring → also feeds content_queue |
| trend_monitor | 2 | Pro | 5 trending topics with content angles → also feeds content_queue |
| social_post_generator | 3 | Pro | 5 platform-ready posts in brand voice |
| publisher | 2 | Pro | Platform-specific formatting |
| audit_agent | 4 | Pro | Reference file health scoring (/18) |

## Scheduled Agent Chains

- Vercel cron hits `/api/cron/schedules` every 5 minutes
- Checks `agent_schedules` for due jobs (frequencies: 4h, 8h, 12h, 24h, 7d)
- Single agents dispatch directly; chains use `chain-runner.ts`
- Chains execute steps sequentially with `input_mapping` between steps
- 3 pre-built templates: Research→Publish, Weekly Audit, Trend→Social
- Token usage tracked per call (provider, model, tokens, estimated cost)
- Monthly budget caps with auto-skip when over budget

## Content Queue

Centralized approval pipeline between research/agents and content generation:
- Sources: research_scout, trend_monitor, manual entry, research findings, OpenClaw
- Statuses: pending → approved → generated (or rejected)
- One-click repurpose to any format: ad_copy, social_post, email_sequence, vsl_script, landing_page, newsletter
- Approval via dashboard UI or Telegram (through OpenClaw bridge on M1)

## OpenClaw Bridge (M1 Mac Mini)

OpenClaw on M1 connects to Codify's content_queue via API key auth:
- Endpoint: `/api/openclaw/queue` (GET/POST/PATCH, auth via `x-api-key` header)
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (server-side only)
- Polls every 5 minutes, sends pending items to Telegram
- User approves/rejects from phone → updates queue status
- Skill script: `openclaw-skill/codify-queue.js`

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

Tiers: free ($0) → build ($99/mo) → pro ($199/mo) → vip ($497/mo).

## Supabase Tables

- user_profiles — tier, llm_config, github_config
- interview_answers — reference file content cache (file_type + enriched_content)
- research_topics — title, status, content, findings, decision, codify_proposals
- outputs — type, content, options, score_*, scheduled_date, schedule_status
- content_queue — title, summary, source, status, relevance_score, topics, suggested_formats
- agent_jobs — agent_type, config, status, progress, result, error
- agent_schedules — agent_type, frequency, next_run_at, enabled
- agent_chains — name, description, is_template
- agent_chain_steps — chain_id, step_order, agent_type, input_mapping
- agent_chain_runs — chain_id, status, current_step
- agent_chain_run_steps — run_id, step_id, agent_job_id, status
- agent_token_usage — job_id, provider, model, input_tokens, output_tokens, estimated_cost
- agent_budget_settings — monthly_token_cap, alert_threshold
- enrichment_log — user_id, file_type
- integrations — platform connections (Postiz, Buffer, GHL, Mailchimp, Webhooks)

SQL migrations: supabase-schema.sql through supabase-schema-v11.sql (run in order in Supabase SQL Editor).

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx       # For OpenClaw bridge only

# GitHub OAuth App (register at github.com/settings/developers)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
NEXT_PUBLIC_APP_URL=https://codify.build

# Default LLM (Gemini)
GEMINI_API_KEY=xxx

# OpenClaw Bridge (M1 → Codify API)
OPENCLAW_API_KEY=xxx                # Shared secret between Vercel + M1
```

## Key Patterns

- **GitHub-first:** RepoContext loads files from GitHub on mount. All writes commit to GitHub. Supabase interview_answers is a background cache.
- **Progressive unlock:** Sidebar items gate on file completeness (useRepo().fileCompleteness) AND tier (useTier()).
- **Supabase as job queue:** Agent dispatch creates a row in agent_jobs, fire-and-forget worker processes it.
- **Content queue as pipeline:** Research/agents feed ideas → user approves → one-click repurpose to any format.
- **Chain execution:** chain-runner.ts advances step-by-step with input_mapping. Each step's output maps to next step's input.
- **Codify flow:** Research decision → LLM generates proposed updates → user reviews diff → applies per-file.
- **BYOLLM:** Users configure provider/key/model in Settings. callLLM() dispatches to the right provider.
- **Scoring loop:** Generated content → LLM scores against reference files → suggestions feed back into research.
- **API key auth:** OpenClaw bridge uses x-api-key header (not session auth) for machine-to-machine access.

## Common Issues

- API routes returning 403? Check tier default is "vip" not "free".
- Agent stuck on "Launching"? Check dispatch route tier default + error display in UI.
- Research AI failing silently? Error state added — look for the red error banner.
- File writes via Python heredocs corrupt JSX unicode escapes. Use node -e for JSX-heavy files.
- Build errors from agents/[id]/page.tsx importing server modules? Pre-existing — doesn't affect other pages.
- useSearchParams() build error? Wrap the component in `<Suspense>` (already done for onboarding page).
- `.eq("id", user.id)` → should be `.eq("user_id", user.id)` everywhere. All fixed, but watch for this in new routes.

## Git Convention

`[type] Brief description` — types: [add], [update], [fix], [remove], [refactor]

## Dev Commands

```bash
cd ~/Documents/GitHub/codify-app   # canonical working directory
npm run dev        # localhost:3000
npm run build      # production build check
git push           # pushes to mike-scott-darwin/codify-app
vercel --prod      # deploy to codify.build
```
