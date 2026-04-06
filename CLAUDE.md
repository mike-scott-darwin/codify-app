# Codify — codify.build

## What This Is
Marketing and product site for Codify — a service that extracts business owners' expertise into structured documents so AI actually knows their business. Built by Mike Scott.

## Tech Stack
- **Framework**: Next.js (App Router) on Vercel
- **Styling**: Tailwind CSS, dark theme
- **Payments**: Stripe Checkout via `/api/checkout` route (Pro $199/mo, VIP $497/mo)
- **CRM**: GoHighLevel (GHL) — v1 REST API + OAuth MCP tool
- **Scan Pipeline**: Node.js poller on M1 Mac Mini (Tailscale: 100.88.4.114, user: michaelscott)

## Key Architecture Decisions

### Site Structure
- `/` — Homepage (hero, problem, mechanism, pricing, FAQ, CTA)
- `/get-started` — Opportunity Scan intake form (lead capture, NOT payment)
- `/pricing` — Tier comparison, CTAs go to Stripe checkout via `/api/checkout`
- `/results` — Proof/testimonials page, CTAs are "Join Pro" / "Join VIP" → `/pricing`
- `/about` — Founder story
- `/welcome` — Post-payment success page

### CTA Strategy (DECIDED — do not change without asking)
- **Homepage, About, Nav**: "Find My Missing Revenue" → `/get-started` (they don't know us yet)
- **Results page**: "Join Pro" / "Join VIP" → `/pricing` (they've seen proof)
- **Pricing page**: "Join Pro" / "Join VIP" → Stripe checkout (ready to buy)

### Stripe Integration
- Checkout API: `src/app/api/checkout/route.ts` — creates Stripe sessions
- Webhook: `src/app/api/webhook/stripe/route.ts` — handles `checkout.session.completed`, upserts to GHL
- Price IDs: pro-monthly, pro-annual, vip-monthly, vip-annual (mapped in checkout route)

### Scan Pipeline (M1 Mac Mini)
- `scan-handler/src/poller.js` — polls GHL every 30s for `opportunity-scan` tagged contacts
- 3 parallel scanners: Google (Gemini), Claude (Sonnet), Codex (GPT-4o)
- `assessor.js` — synthesizes scanner results into email HTML with bridge to Codify offering
- `deliver.js` — saves email HTML to GHL custom field (`scan_email_html`), GHL workflow sends email
- All scanners strip markdown fences from JSON responses

### GHL Integration
- Location ID: `AKRQpXEUDgloSAbxzDmh`
- v1 API works for: contact CRUD, tags, custom fields
- v1 API does NOT work for: sending emails (use workflow or MCP)
- Custom fields: `scan_email_html` (LARGE_TEXT), `scan_email_subject` (TEXT)
- Booking calendar: Codify Strategy Call

## Copy Principles (DECIDED)
- Speak to **business owners**, not developers
- Use revenue/profit/clients language, NOT agents/RAG/embeddings/context engineering
- Keep headlines short and punchy
- Hero subhead: two lines, business-outcome focused
- "Find My Missing Revenue" is the primary CTA text for cold traffic

## Key Files
- `src/site-config.ts` — Central config for all site copy (THE most important file)
- `src/components/hero.tsx` — Hero section (mobile spacing already optimized)
- `src/components/problem.tsx` — Problem section
- `src/components/nav.tsx` — Navigation
- `src/app/pricing/page.tsx` — Pricing with Stripe checkout integration

## Environment
- Vercel deploys from branch `mike-scott-darwin/codify-site-deploy`
- M1 env at `~/scan-handler/.env` (GHL, Anthropic, OpenAI, Google keys)
- Node v25.7.0 on M1 at `/opt/homebrew/bin/node`
