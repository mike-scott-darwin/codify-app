# Codify Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CODIFY PLATFORM                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 1. BUILD │→ │2.RESEARCH│→ │3. CREATE │→ │4. PUBLISH│       │
│  │          │  │          │  │          │  │          │       │
│  │ soul.md  │  │ AI       │  │ Ads      │  │ Calendar │       │
│  │ offer.md │  │ Research  │  │ Social   │  │ Outputs  │       │
│  │audience.md│  │ Decisions│  │ Email    │  │ Platforms│       │
│  │ voice.md │  │ Codify   │  │ VSL      │  │          │       │
│  └────┬─────┘  └────┬─────┘  │ Landing  │  └────┬─────┘       │
│       │              │        │Newsletter│       │              │
│       │              │        └────┬─────┘       │              │
│       └──────────────┴─────────────┴─────────────┘              │
│                    THE COMPOUNDING LOOP                          │
│           Research feeds Reference feeds Output                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scheduled Agent Chain System

```
┌─────────────────────────────────────────────────────────────┐
│                     CRON SCHEDULER                           │
│              (runs every 5 minutes)                          │
│                                                              │
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
   └──────────────┘    │  Step 1 → Step 2 → Step 3│
                       │                          │
                       │  Each step:              │
                       │  1. Run agent            │
                       │  2. Read output           │
                       │  3. Map to next input    │
                       │  4. Advance chain        │
                       └──────────────────────────┘
```

## Pre-Built Chain Templates

### Chain 1: Research → Publish
```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  RESEARCH SCOUT │────▶│ SOCIAL POST          │────▶│   PUBLISHER     │
│                 │     │ GENERATOR            │     │                 │
│ • Scans niche   │     │                      │     │ • Formats for   │
│   trends        │     │ • Takes research     │     │   each platform │
│ • Scores by     │     │   findings           │     │ • Platform-     │
│   relevance     │     │ • Uses voice.md      │     │   specific      │
│ • Finds content │     │   for tone           │     │   optimization  │
│   angles        │     │ • Creates 5 posts    │     │ • Ready to post │
│                 │     │   per platform       │     │                 │
│ Output:         │     │                      │     │ Output:         │
│ Research brief  │     │ Output:              │     │ Publish-ready   │
│ with findings   │     │ Multi-platform posts │     │ content         │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
```

### Chain 2: Weekly Audit
```
┌─────────────────────────────────────────┐
│             AUDIT AGENT                  │
│                                          │
│  Runs: Weekly                            │
│                                          │
│  Step 1: Inventory reference files       │
│  Step 2: Score completeness (0-3 each)   │
│  Step 3: Check consistency across files  │
│  Step 4: Generate health report          │
│                                          │
│  Output:                                 │
│  • File-by-file scores                   │
│  • Gaps identified                       │
│  • Specific recommendations             │
│  • Overall health score /18              │
└─────────────────────────────────────────┘
```

### Chain 3: Trend → Social
```
┌─────────────────┐     ┌─────────────────────┐
│  TREND MONITOR  │────▶│ SOCIAL POST          │
│                 │     │ GENERATOR            │
│ • 5 trending    │     │                      │
│   topics        │     │ • Converts trends    │
│ • Relevance     │     │   into posts         │
│   scores        │     │ • Matches brand      │
│ • Content       │     │   voice              │
│   angles        │     │ • Multi-platform     │
│                 │     │                      │
└─────────────────┘     └─────────────────────┘
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
└──────────────┘
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
│  • Monthly token cap (configurable)                  │
│  • Alert at 80% threshold                            │
│  • Auto-skip scheduled runs when over budget         │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

```
┌─────────────────────────────────────────────┐
│  Frontend        │  Next.js 16 (App Router) │
│  Auth            │  Supabase (email OTP)    │
│  Database        │  Supabase PostgreSQL     │
│  LLM (default)   │  Gemini 2.0 Flash       │
│  LLM (BYOLLM)    │  OpenAI / Anthropic /   │
│                  │  Ollama                  │
│  File Storage    │  GitHub API              │
│  Scheduling      │  Vercel Cron             │
│  Integrations    │  GHL / Postiz / Buffer / │
│                  │  Mailchimp / Webhooks    │
└─────────────────────────────────────────────┘
```

## Database Schema (Key Tables)

```
auth.users
    │
    ├── user_profiles (tier, llm_config, github_config)
    │
    ├── interview_answers (reference files: soul, offer, audience, voice)
    │
    ├── research_topics (research → deciding → decided → codified)
    │
    ├── outputs (generated content + scoring + scheduling)
    │
    ├── agent_jobs (individual agent runs)
    │
    ├── agent_schedules (cron definitions)
    │
    ├── agent_chains (chain definitions)
    │   └── agent_chain_steps (ordered steps)
    │
    ├── agent_chain_runs (chain executions)
    │   └── agent_chain_run_steps (step-level tracking)
    │
    ├── agent_token_usage (per-call metering)
    │
    ├── agent_budget_settings (monthly caps)
    │
    └── integrations (platform connections)
```

## UI Navigation

```
┌─────────────────┐
│    SIDEBAR       │
│                  │
│  ■  Dashboard    │
│  1  Build        │ ← Reference files
│  2  Research     │ ← AI research + codify
│  3  Create       │ ← Generate content
│  4  Publish      │ ← Output history
│  ▦  Calendar     │ ← Visual scheduling
│  6  Automate     │ ← Agent chains
│     ├─ Agents    │   One-off agents
│     ├─ Schedules │   Cron management
│     ├─ Chains    │   Pipeline templates
│     └─ Usage     │   Token tracking
│  ❯  Terminal     │ ← Slash commands
│  ?  Help         │ ← FAQ
│  ⚙  Settings     │ ← Config, BYOLLM, integrations
└─────────────────┘
```

## Tier System

```
┌──────────┬──────────┬──────────┬──────────┐
│   FREE   │  BUILD   │   PRO    │   VIP    │
│   $0     │  $99/mo  │ $199/mo  │ $497/mo  │
├──────────┼──────────┼──────────┼──────────┤
│ Dashboard│ + Build  │ + Agents │ + All    │
│          │ + Research│ + Chains │ + Unlimited│
│          │ + Create │ + Calendar│ + Priority│
│          │ + Publish│ + Schedules│         │
│          │          │ + Usage  │          │
└──────────┴──────────┴──────────┴──────────┘

Currently defaulted to VIP (until Stripe is wired)
```
