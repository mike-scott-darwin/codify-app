# Codify Architecture

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CODIFY PLATFORM                                     │
│                           codify.build (Vercel)                                  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           USER JOURNEY                                     │ │
│  │                                                                            │ │
│  │   Login ──▶ Onboarding ──▶ Dashboard ──▶ Build ──▶ Research ──▶ Create    │ │
│  │   (OTP)    (GitHub OAuth)  (Home)       (Refs)    (AI)         (Content)   │ │
│  │             Workspace                                                      │ │
│  │             Interview                                                      │ │
│  │             File Tree                                                      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 1. BUILD │  │2.RESEARCH│  │ 3. QUEUE │  │4. CREATE │  │5. PUBLISH│         │
│  │          │  │          │  │          │  │          │  │          │         │
│  │ soul.md  │  │ Topics   │  │ Pending  │  │ Ad Copy  │  │ Calendar │         │
│  │ offer.md │  │ AI Ask   │  │ Approve  │  │ Social   │  │ Schedule │         │
│  │audience.md│  │ Codify   │  │ Reject   │  │ Email    │  │ Score    │         │
│  │ voice.md │  │ →Ref     │  │ Repurpose│  │ VSL      │  │ Publish  │         │
│  │          │  │          │  │          │  │ Landing  │  │          │         │
│  │ Enrich   │  │ →Queue   │  │ →Create  │  │Newsletter│  │ Postiz   │         │
│  │ GitHub   │  │          │  │          │  │          │  │ Buffer   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │ GHL     │         │
│       │              │              │              │        │ Mailchimp│         │
│       │              │              │              │        │ Webhook  │         │
│       └──────────────┴──────────────┴──────────────┘        └────┬─────┘         │
│                    THE COMPOUNDING LOOP                          │               │
│           Research feeds Reference feeds Output                  │               │
│           Output performance feeds Research                      │               │
└──────────────────────────────────────────────────────────────────┼───────────────┘
                                                                   │
                                                                   │
┌──────────────────────────────────────────────────────────────────┼───────────────┐
│                        AUTOMATION LAYER                          │               │
│                                                                  │               │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │               │
│  │     VERCEL CRON           │    │     M1 MAC MINI          │   │               │
│  │     (every 5 min)         │    │     (always on)          │   │               │
│  │                           │    │                          │   │               │
│  │  agent_schedules          │    │  OpenClaw + Telegram     │   │               │
│  │  ├── Single agents        │    │                          │   │               │
│  │  └── Chain execution      │    │  Polls /api/openclaw/    │◀──┘               │
│  │      Step 1 → 2 → 3      │    │  queue every 5 min       │                   │
│  │      input_mapping        │    │                          │                   │
│  │                           │    │  Sends to Telegram:      │                   │
│  │  Results → content_queue  │───▶│  "📋 New content idea"   │                   │
│  │  Results → outputs        │    │                          │                   │
│  │                           │    │  You reply:              │                   │
│  │  Token tracking           │    │  "approve <id>"          │                   │
│  │  Budget enforcement       │    │  "reject <id>"           │                   │
│  └──────────────────────────┘    └──────────────────────────┘                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Authentication & Onboarding Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Login   │────▶│  Supabase    │────▶│   Onboarding    │────▶│  Dashboard   │
│  Page    │     │  Email OTP   │     │                 │     │              │
└──────────┘     └──────────────┘     │ 1. GitHub OAuth │     │  Ready to    │
                                      │    (one-click)  │     │  Build/      │
                                      │                 │     │  Research/   │
                                      │ 2. Create       │     │  Create      │
                                      │    Workspace    │     │              │
                                      │    (private     │     └──────────────┘
                                      │     repo)       │
                                      │                 │
                                      │ 3. File Tree    │
                                      │    Visualization│
                                      │    ├── soul.md  │
                                      │    ├── offer.md │
                                      │    ├── audience │
                                      │    └── voice.md │
                                      │                 │
                                      │ 4. Interview    │
                                      │    (guided Q&A  │
                                      │     + file      │
                                      │     upload)     │
                                      │                 │
                                      │ 5. AI Enrich    │
                                      │    each answer  │
                                      └─────────────────┘
```

## Content Queue Pipeline

```
                    SOURCES                              QUEUE                    OUTPUT
    ┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────┐
    │                          │     │                          │     │                  │
    │  Research Scout agent ───┼────▶│                          │     │  Ad Copy         │
    │  Trend Monitor agent  ───┼────▶│     content_queue        │     │  Social Post     │
    │  Manual entry         ───┼────▶│                          │────▶│  Email Sequence  │
    │  Research findings    ───┼────▶│  status:                 │     │  VSL Script      │
    │  OpenClaw (Telegram)  ───┼────▶│  • pending   (new)      │     │  Landing Page    │
    │                          │     │  • approved  (ready)    │     │  Newsletter      │
    │                          │     │  • rejected  (skipped)  │     │                  │
    │                          │     │  • generated (done)     │     └──────────────────┘
    │                          │     │                          │              │
    └──────────────────────────┘     │  Approval via:           │              ▼
                                     │  • Dashboard UI          │     ┌──────────────────┐
                                     │  • Telegram (OpenClaw)   │     │  Scoring         │
                                     │                          │     │  • Hook Strength  │
                                     │  One-click repurpose     │     │  • Voice Align   │
                                     │  to any format ─────────┼────▶│  • CTA Clarity   │
                                     │                          │     │  • Audience Match │
                                     └──────────────────────────┘     │  • Emotional Res │
                                                                      └──────────────────┘
```

## Scheduled Agent Chain System

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL CRON (every 5 min)                │
│                                                              │
│   GET /api/cron/schedules                                    │
│   Checks agent_schedules table for due jobs                  │
│   Frequencies: 4h | 8h | 12h | 24h | 7d                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
     Single Agent            Chain Execution
           │                       │
           ▼                       ▼
   ┌──────────────┐    ┌──────────────────────────┐
   │  agent_jobs   │    │    chain-runner.ts        │
   │  (one-off)    │    │                          │
   │               │    │  Step 1 → Step 2 → Step 3│
   │  10 agent     │    │                          │
   │  types        │    │  Each step:              │
   │  available    │    │  1. Run agent            │
   │               │    │  2. Read output          │
   │  Progress:    │    │  3. Map to next input    │
   │  step X of Y  │    │     (input_mapping)      │
   │  current      │    │  4. Advance chain        │
   │  action text  │    │  5. Log token usage      │
   └──────────────┘    └──────────────────────────┘
```

## Pre-Built Chain Templates

### Chain 1: Research → Publish
```
Research Scout ──▶ Social Post Generator ──▶ Publisher
(3 steps)         (3 steps)                  (2 steps)
Scans niche       Takes findings             Formats for
trends            Uses voice.md              each platform
Scores by         Creates 5 posts            Platform-specific
relevance         per platform               optimization
```

### Chain 2: Weekly Audit
```
Audit Agent (4 steps, runs weekly)
Step 1: Inventory reference files
Step 2: Score completeness (0-3 each)
Step 3: Check consistency across files
Step 4: Generate health report with score /18
```

### Chain 3: Trend → Social
```
Trend Monitor ──▶ Social Post Generator
(2 steps)         (3 steps)
5 trending        Converts trends
topics with       into brand-voice
content angles    posts
```

## Data Flow

```
┌──────────────┐
│   SUPABASE   │
│              │
│ ┌──────────┐ │     ┌──────────────┐     ┌──────────────┐
│ │ Schedules│─┼────▶│ Cron Runner  │────▶│ Agent Runner  │
│ └──────────┘ │     └──────────────┘     └──────┬───────┘
│              │                                  │
│ ┌──────────┐ │     ┌──────────────┐            │
│ │  Chains  │─┼────▶│ Chain Runner │◀───────────┘
│ └──────────┘ │     └──────┬───────┘    (advanceChain)
│              │            │
│ ┌──────────┐ │            │
│ │  Jobs    │◀┼────────────┘
│ └──────────┘ │
│              │
│ ┌──────────┐ │     ┌──────────────┐
│ │  Token   │◀┼─────│  LLM Call    │
│ │  Usage   │ │     │  (tracked)   │
│ └──────────┘ │     └──────────────┘
│              │
│ ┌──────────┐ │     ┌──────────────┐
│ │  Budget  │─┼────▶│ Enforcement  │──── Blocks dispatch
│ │ Settings │ │     │  Check       │     if over cap
│ └──────────┘ │     └──────────────┘
│              │
│ ┌──────────┐ │     ┌──────────────┐
│ │  Content │─┼────▶│ OpenClaw     │──── Telegram
│ │  Queue   │ │     │ Bridge (M1)  │     approval
│ └──────────┘ │     └──────────────┘
└──────────────┘
```

## LLM Provider Architecture

```
┌─────────────────────────────────────────────────┐
│              callLLM() abstraction               │
│                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Gemini    │ │   OpenAI    │ │ Anthropic  │ │
│  │ 2.0 Flash  │ │ gpt-4o-mini │ │  Sonnet    │ │
│  │ (default)  │ │             │ │            │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
│                                                  │
│  ┌─────────────┐                                │
│  │   Ollama    │  BYOK: Users bring own keys    │
│  │  llama3.1   │  per provider via Settings     │
│  │  (local)    │                                │
│  └─────────────┘                                │
└─────────────────────────────────────────────────┘
```

## Token Economics

```
┌─────────────────────────────────────────────────────┐
│                 COST PER AGENT RUN                   │
│                                                      │
│  Provider          │ Per Run (~7K tokens) │ Monthly  │
│  ──────────────────┼─────────────────────┼───────── │
│  Gemini Flash      │ ~$0.001             │ ~$0.20   │
│  GPT-4o mini       │ ~$0.003             │ ~$0.50   │
│  Claude Haiku      │ ~$0.005             │ ~$0.75   │
│  GPT-4o            │ ~$0.03              │ ~$5.00   │
│  Claude Sonnet     │ ~$0.04              │ ~$6.00   │
│                                                      │
│  Based on: 5 agents running daily (150 runs/month)   │
│                                                      │
│  Budget Controls:                                    │
│  • Monthly token cap (configurable per user)         │
│  • Alert at 80% threshold                            │
│  • Auto-skip scheduled runs when over budget         │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

```
┌─────────────────────────────────────────────┐
│  Frontend        │  Next.js 16 (App Router) │
│  Styling         │  Tailwind CSS 4          │
│  Components      │  shadcn/ui               │
│  Auth            │  Supabase (email OTP)    │
│  Database        │  Supabase PostgreSQL     │
│  Security        │  Row-Level Security      │
│  LLM (default)   │  Gemini 2.0 Flash       │
│  LLM (BYOK)      │  OpenAI / Anthropic /   │
│                  │  Ollama                  │
│  File Storage    │  GitHub API (OAuth)      │
│  Scheduling      │  Vercel Cron             │
│  M1 Bridge       │  OpenClaw + Telegram     │
│  Integrations    │  GHL / Postiz / Buffer / │
│                  │  Mailchimp / Webhooks    │
│  Deployment      │  Vercel (codify.build)   │
│  Design          │  Dark terminal aesthetic │
│                  │  #0a0a0a / green / blue  │
└─────────────────────────────────────────────┘
```

## Database Schema

```
auth.users
    │
    ├── user_profiles          (tier, llm_config, github_config)
    │
    ├── interview_answers      (soul, offer, audience, voice reference files)
    │
    ├── research_topics        (research → deciding → decided → codified)
    │
    ├── outputs                (generated content + scores + scheduling)
    │   ├── score_*            (5 scoring dimensions)
    │   ├── scheduled_date     (calendar scheduling)
    │   └── schedule_status    (unscheduled/scheduled/published)
    │
    ├── content_queue          (approval pipeline)
    │   ├── status             (pending/approved/rejected/generated)
    │   ├── source             (research_scout/trend_monitor/manual/openclaw)
    │   ├── relevance_score    (0-100)
    │   └── suggested_formats  (ad_copy/social_post/email/vsl/landing/newsletter)
    │
    ├── agent_jobs             (individual agent runs with progress tracking)
    │
    ├── agent_schedules        (cron definitions: frequency, next_run_at)
    │
    ├── agent_chains           (chain definitions + templates)
    │   └── agent_chain_steps  (ordered steps with input_mapping)
    │
    ├── agent_chain_runs       (chain executions)
    │   └── agent_chain_run_steps (step-level tracking)
    │
    ├── agent_token_usage      (per-call metering: provider, model, tokens, cost)
    │
    ├── agent_budget_settings  (monthly caps + alert thresholds)
    │
    ├── enrichment_log         (enrichment tracking per file type)
    │
    └── integrations           (platform connections: Postiz, Buffer, GHL, etc.)
```

## UI Navigation

```
┌─────────────────┐
│    SIDEBAR       │
│                  │
│  ■  Dashboard    │ ← Overview
│  ◇  Build        │ ← Reference files (1+ file required)
│  ◆  Research     │ ← AI research + codify (2+ files, build+)
│  ≡  Queue        │ ← Content approval pipeline (2+ files, build+)
│  ⚡ Create       │ ← Generate content (4 files, pro+)
│  ▸  Publish      │ ← Output history (pro+)
│  ▦  Calendar     │ ← Visual scheduling (4 files, pro+)
│  ◎  Automate     │ ← Agent system (4 files, build+)
│     ├─ Agents    │   One-off agent runs
│     ├─ Schedules │   Cron management
│     ├─ Chains    │   Pipeline templates
│     └─ Usage     │   Token tracking + budgets
│  ❯  Terminal     │ ← Slash commands
│  ?  Help         │ ← FAQ
│  ⚙  Settings     │ ← Config, BYOK, integrations
└─────────────────┘

Progressive unlock: features enable as reference files complete
Tier gating: advanced features require higher tiers
```

## Tier System

```
┌──────────┬──────────┬──────────┬──────────┐
│   FREE   │  BUILD   │   PRO    │   VIP    │
│   $0     │  $99/mo  │ $199/mo  │ $497/mo  │
├──────────┼──────────┼──────────┼──────────┤
│ Dashboard│ + Build  │ + Create │ Unlimited│
│          │ + Research│   (all   │ everything│
│          │ + Queue  │   types) │          │
│          │ + Social │ + Agents │ Priority │
│          │   (5/mo) │   (all   │ support  │
│          │ + Audit  │   10)    │          │
│          │   (1/mo) │ + Chains │          │
│          │ + Deep   │ + Sched  │          │
│          │   Research│ + Calendar│         │
│          │   (2/mo) │ + Publish│          │
└──────────┴──────────┴──────────┴──────────┘

Currently defaulted to VIP (until Stripe is wired)
```

## Predictive Performance Scoring

```
┌────────────────────────────────────────────┐
│         5-DIMENSION SCORING                 │
│                                            │
│  Hook Strength ........... 20% weight      │
│  Voice Alignment ......... 25% weight      │
│  CTA Clarity ............. 15% weight      │
│  Audience Match .......... 25% weight      │
│  Emotional Resonance ..... 15% weight      │
│                                            │
│  Weights adjust by content type:           │
│  • Ads: CTA + Hook weighted higher         │
│  • Social: Emotional + Voice higher        │
│  • Email: CTA + Audience higher            │
│                                            │
│  Score range: 0-100                        │
│  Displayed as radar chart on each output   │
└────────────────────────────────────────────┘
```

## OpenClaw Bridge (M1 Mac Mini)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Codify (Vercel)              M1 Mac Mini                   │
│                                                              │
│  Agent chains run ──────▶ content_queue ──────▶ OpenClaw     │
│  on cron schedule         (Supabase)           polls API     │
│                                                 every 5 min  │
│                                                    │         │
│                                                    ▼         │
│                                               ┌─────────┐   │
│                                               │Telegram  │   │
│                                               │Bot       │   │
│                                               │          │   │
│                                               │"📋 New   │   │
│  PATCH /api/openclaw/  ◀─────── approve ◀──── │ content  │   │
│  queue {action:approve}         reject         │ idea..." │   │
│                                               └─────────┘   │
│                                                              │
│  Auth: x-api-key header (machine-to-machine)                │
│  No session required — service role key on Vercel            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## API Route Map (37 endpoints)

```
/api
├── agent/
│   ├── dispatch        POST    Create + kick off agent job
│   ├── run/[id]        POST    Execute job (internal)
│   ├── status/[id]     GET     Poll job status + progress
│   ├── schedules       GET/POST/PATCH/DELETE
│   ├── chains          GET/POST
│   ├── chains/[id]     GET/POST/DELETE
│   └── usage           GET/PATCH
├── auth/
│   └── github          GET     OAuth redirect
│       └── callback    GET     Token exchange + save
├── content-queue/
│   ├── (root)          GET/POST
│   ├── [id]            PATCH/DELETE
│   ├── [id]/repurpose  POST    Generate all formats
│   └── from-research   POST    Create from findings
├── cron/
│   └── schedules       GET     Vercel cron trigger
├── github/
│   ├── config          GET/PUT
│   ├── create-repo     POST
│   ├── files           GET/PUT
│   └── init            POST
├── integrations/
│   ├── (root)          GET/POST/DELETE
│   ├── publish         POST
│   └── test            POST
├── openclaw/
│   └── queue           GET/PATCH/POST  (API key auth)
├── outputs/
│   ├── (root)          GET
│   ├── [id]            GET/PATCH/DELETE
│   └── calendar        GET
├── reference/
│   ├── save            POST
│   └── enhance         POST
├── research/
│   ├── (root)          GET/POST
│   ├── [id]            GET/PATCH/DELETE
│   ├── [id]/ai         POST
│   └── [id]/codify     POST
├── score               POST
├── user/
│   ├── tier            GET
│   └── llm-config      GET/PUT
├── enrich              POST
├── generate            POST
└── terminal            POST
```
