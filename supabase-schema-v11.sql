-- Content Queue: Items awaiting human approval before generation
CREATE TABLE IF NOT EXISTS public.content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  summary text,
  source text DEFAULT 'manual', -- 'research_scout', 'trend_monitor', 'manual', 'research'
  source_url text,
  relevance_score integer DEFAULT 0, -- 0-100
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'generated')),
  topics text[], -- relevant topics/tags
  suggested_formats text[], -- which content types to generate
  user_feedback text, -- why they approved/rejected (for adaptive scoring)
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own queue" ON public.content_queue FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_content_queue_user_status ON public.content_queue (user_id, status);
