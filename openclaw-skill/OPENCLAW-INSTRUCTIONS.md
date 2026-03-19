# Codify Queue Bridge — OpenClaw M1 Instructions

## What This Does

Connects OpenClaw on your M1 Mac Mini to Codify's content queue.
When Codify's agent chains generate content ideas, they land in the queue.
OpenClaw polls the queue and sends items to you via Telegram for approval.

## Flow

```
Codify agent chains (Vercel cron)
  → content_queue table (Supabase)
    → OpenClaw polls /api/openclaw/queue (every 5 min)
      → Sends pending items to Telegram
        → You reply approve/reject
          → OpenClaw updates queue via API
            → Approved items ready for publishing
```

## Setup on M1

### 1. Set Environment Variables

Add to your `.env` or OpenClaw config on the M1:

```bash
export CODIFY_API_URL="https://codify.build"
export CODIFY_API_KEY="your-secret-key-here"
export CODIFY_USER_ID="your-supabase-user-id"
```

To find your Supabase user ID:
- Go to your Supabase dashboard → Authentication → Users
- Copy the UUID for your email

### 2. Copy the Skill

```bash
# On M1
mkdir -p ~/.openclaw/skills/codify-queue
cp codify-queue.js ~/.openclaw/skills/codify-queue/index.js
```

### 3. Test It

```bash
node ~/.openclaw/skills/codify-queue/index.js poll
```

### 4. Add to OpenClaw Workspace Instructions

Add this to your OpenClaw AGENTS.md or workspace config on the M1:

```
## Codify Queue Monitor

Every 5 minutes, check the Codify content queue for pending items:

  node ~/.openclaw/skills/codify-queue/index.js poll

If there are pending items:
1. Format each item with title, summary, score, and source
2. Send to Telegram as a message
3. Wait for my reply

When I reply:
- "approve <id>" or "yes <id>" → run: node codify-queue.js approve <id>
- "reject <id>" or "no <id>" → run: node codify-queue.js reject <id>
- "approve all" → approve all pending items
- "reject all" → reject all pending items

When I say "add to queue: [topic]" → run: node codify-queue.js add "[topic]"
```

### 5. Set Up Cron (Alternative to OpenClaw Polling)

If you prefer a cron-based approach instead of OpenClaw polling:

```bash
# Add to crontab on M1
*/5 * * * * cd ~/.openclaw/skills/codify-queue && node index.js poll >> /var/log/codify-queue.log 2>&1
```

## Vercel Environment Variable

Add this to your Vercel project:

```
OPENCLAW_API_KEY=your-secret-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Generate the API key:
```bash
openssl rand -hex 32
```

Use the same key in both Vercel (OPENCLAW_API_KEY) and M1 (CODIFY_API_KEY).

## Security

- API key auth (not session-based) — designed for machine-to-machine
- Service role key bypasses RLS (only used server-side on Vercel)
- Never expose the API key in client-side code
- The M1 connects outbound only — no ports exposed
