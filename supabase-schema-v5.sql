-- Add codify_proposals column to research_topics
ALTER TABLE public.research_topics ADD COLUMN IF NOT EXISTS codify_proposals jsonb DEFAULT NULL;
-- Stores: { soul: "proposed content...", offer: "proposed content..." }
