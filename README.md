# Codify

**The system for staying connected to your work while AI handles the execution.**

Live at [codify.build](https://codify.build)

---

## What It Does

Codify turns your business knowledge into a precision instrument for AI content generation. You build four reference files — soul, offer, audience, voice — and every output (ads, emails, social posts, VSLs, landing pages) is informed by who you actually are.

This isn't prompt engineering. It's active reference management. The more you refine your files, the better every output gets.

## How It Works

```
BUILD → RESEARCH → QUEUE → CREATE → PUBLISH
  │         │         │        │         │
soul.md   AI       Content   Ads      Calendar
offer.md  Topics   Queue     Social   Scheduling
audience  Codify   Approve   Email    Platforms
voice.md  →Ref     Reject    VSL      Publishing
                              Landing
                              Newsletter
```

1. **Build** your reference files through guided interviews
2. **Research** topics with AI — codify insights back into reference
3. **Queue** content ideas from research, trends, or manual input
4. **Create** content informed by your complete business context
5. **Publish** with scheduling, scoring, and multi-platform distribution

## The Compounding Loop

Research feeds reference. Reference feeds output. Output performance feeds research. Every cycle makes the system smarter about your specific business.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Supabase (email OTP) |
| Database | Supabase PostgreSQL + RLS |
| LLM (default) | Gemini 2.0 Flash |
| LLM (BYOK) | OpenAI, Anthropic, Ollama |
| File Storage | GitHub API (OAuth flow) |
| Scheduling | Vercel Cron (5-min interval) |
| Publishing | Postiz, Buffer, Mailchimp, GoHighLevel, Webhooks |
| M1 Bridge | OpenClaw + Telegram (approve/reject from phone) |
| Deployment | Vercel (codify.build) |

## Features

### Reference File System
- Guided interview onboarding (soul, offer, audience, voice)
- AI enrichment per question
- GitHub-backed storage with OAuth (no PATs)
- File tree visualization during setup

### Research Workspace
- Create research topics with state machine (research → deciding → decided → codified)
- AI research assistant with multi-angle analysis
- Codify findings back into reference files
- Send research to content queue

### Content Queue
- Centralized approval pipeline
- Sources: research scouts, trend monitors, manual, research findings
- Approve/reject with feedback
- One-click repurpose to any format (ad, social, email, VSL, landing page, newsletter)
- OpenClaw bridge for Telegram approval from phone

### Content Generation
- 6 output types: ad copy, social posts, email sequences, VSL scripts, landing pages, newsletters
- Every output informed by all 4 reference files
- Predictive performance scoring (5 dimensions: Hook Strength, Voice Alignment, CTA Clarity, Audience Match, Emotional Resonance)

### Agent System (10 Agents)
| Agent | Steps | Tier | Purpose |
|-------|-------|------|---------|
| Congruence Audit | 4 | Build | Check alignment across reference files |
| Deep Research | 5 | Build | Multi-angle research on any topic |
| Ad Campaign | 5 | Pro | Full campaign: angles, hooks, copy, compliance, ranking |
| Content Calendar | 5 | Pro | Weekly content planning with platform assignments |
| Email Campaign | 5 | Pro | Sequence with arc planning, subject lines, timing |
| Research Scout | 3 | Pro | Trending topics + relevance scoring |
| Trend Monitor | 2 | Pro | 5 trending topics with content angles |
| Social Post Generator | 3 | Pro | 5 platform-ready posts in brand voice |
| Publisher | 2 | Pro | Platform-specific formatting |
| Audit Agent | 4 | Pro | Reference file health scoring |

### Scheduled Agent Chains
- Cron-based automation (4h, 8h, 12h, 24h, 7d intervals)
- Chain templates: Research → Publish, Weekly Audit, Trend → Social
- Token usage tracking and monthly budget caps
- Auto-skip when over budget

### Calendar
- Month view with drag-and-drop scheduling
- Content type filtering
- Day detail modal

### OpenClaw Bridge (M1 Mac Mini)
- Polls content queue via API key auth
- Sends pending items to Telegram
- Approve/reject from phone
- Adds items to queue from Telegram

### Tier System
| | FREE | BUILD ($99) | PRO ($199) | VIP ($497) |
|---|---|---|---|---|
| Dashboard | x | x | x | x |
| Reference Files | | x | x | x |
| Research | | x | x | x |
| Content Queue | | x | x | x |
| Generation | | 5/mo social | 50/mo all types | Unlimited |
| Agents | | Audit + Research | All 10 | All 10 |
| Chains/Schedules | | | x | x |
| Calendar | | | x | x |

*Currently defaulted to VIP for testing*

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agent/          # dispatch, run, status, schedules, chains, usage
│   │   ├── auth/github/    # OAuth flow (redirect + callback)
│   │   ├── content-queue/  # CRUD + repurpose + from-research
│   │   ├── cron/           # Vercel cron trigger
│   │   ├── github/         # config, create-repo, files, init
│   │   ├── integrations/   # publish, test
│   │   ├── openclaw/       # queue bridge (API key auth)
│   │   ├── outputs/        # list, detail, calendar view
│   │   ├── reference/      # save, enhance
│   │   ├── research/       # topics, AI, codify
│   │   ├── score/          # predictive scoring
│   │   ├── user/           # tier, llm-config
│   │   ├── enrich/         # AI enrichment
│   │   ├── generate/       # content generation
│   │   └── terminal/       # slash commands
│   ├── dashboard/
│   │   ├── agents/         # hub, schedules, chains, usage, [id]
│   │   ├── calendar/       # month view
│   │   ├── files/          # reference editor
│   │   ├── generate/       # content creation
│   │   ├── outputs/        # publish history
│   │   ├── queue/          # content queue
│   │   ├── research/       # workspace
│   │   ├── help/           # FAQ
│   │   ├── settings/       # config
│   │   ├── terminal/       # slash commands
│   │   └── upgrade/        # tier upgrade
│   ├── onboarding/         # GitHub OAuth + guided setup
│   └── login/              # Supabase auth
├── lib/
│   ├── agents/             # 10 agent implementations + runner + chain-runner
│   ├── llm/                # provider abstraction (Gemini, OpenAI, Anthropic, Ollama)
│   ├── tier.ts             # feature gating
│   ├── github.ts           # Octokit wrapper
│   ├── supabase*.ts        # client + server clients
│   ├── generation-*.ts     # prompts + types
│   ├── score-*.ts          # predictive scoring
│   └── interview-data.ts   # reference file questions
├── components/
│   ├── dashboard/          # sidebar, score-card, tier-badge, upgrade-prompt
│   └── ui/                 # shadcn components
└── openclaw-skill/         # M1 bridge script + setup docs
```

## Database (11 Migration Versions)

```
auth.users
├── user_profiles          (tier, llm_config, github_config)
├── interview_answers      (soul, offer, audience, voice)
├── research_topics        (research → deciding → decided → codified)
├── outputs                (generated content + scores + scheduling)
├── content_queue          (approval pipeline)
├── agent_jobs             (individual runs)
├── agent_schedules        (cron definitions)
├── agent_chains           (chain definitions)
│   └── agent_chain_steps  (ordered steps)
├── agent_chain_runs       (executions)
│   └── agent_chain_run_steps
├── agent_token_usage      (per-call metering)
├── agent_budget_settings  (monthly caps)
├── enrichment_log         (enrichment tracking)
└── integrations           (platform connections)
```

## API Routes (37 Endpoints)

| Group | Routes | Auth |
|-------|--------|------|
| Agent | dispatch, run/[id], status/[id], schedules, chains, chains/[id], usage | Supabase session |
| Auth | github, github/callback | Public → Supabase |
| Content Queue | list, create, [id] update/delete, [id]/repurpose, from-research | Supabase session |
| Cron | schedules | Vercel cron |
| GitHub | config, create-repo, files, init | Supabase session |
| Integrations | publish, test | Supabase session |
| OpenClaw | queue (GET/POST/PATCH) | API key |
| Outputs | list, [id], calendar | Supabase session |
| Reference | save, enhance | Supabase session |
| Research | list, [id], [id]/ai, [id]/codify | Supabase session |
| Score | score | Supabase session |
| User | tier, llm-config | Supabase session |
| Other | enrich, generate, terminal | Supabase session |

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# OpenClaw Bridge
OPENCLAW_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://codify.build
```

## Development

```bash
npm install
npm run dev        # localhost:3000
npm run build      # production build
vercel --prod      # deploy
```

## Design

Dark terminal aesthetic — `#0a0a0a` background, green/blue/purple accents, monospace font throughout.
