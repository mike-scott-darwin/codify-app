-- Predictive Performance Scoring
ALTER TABLE public.outputs ADD COLUMN IF NOT EXISTS score integer DEFAULT NULL;
ALTER TABLE public.outputs ADD COLUMN IF NOT EXISTS score_breakdown jsonb DEFAULT NULL;
