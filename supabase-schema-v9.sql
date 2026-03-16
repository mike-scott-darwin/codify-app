-- Content Calendar: add scheduling columns to outputs
ALTER TABLE public.outputs ADD COLUMN IF NOT EXISTS scheduled_date date DEFAULT NULL;
ALTER TABLE public.outputs ADD COLUMN IF NOT EXISTS schedule_status text DEFAULT 'draft' CHECK (schedule_status IN ('draft', 'scheduled', 'published', 'failed'));
CREATE INDEX IF NOT EXISTS idx_outputs_scheduled ON public.outputs (user_id, scheduled_date) WHERE scheduled_date IS NOT NULL;
