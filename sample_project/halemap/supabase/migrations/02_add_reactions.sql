-- Create reactions table
CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id),
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(report_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations for reactions" ON public.reactions FOR ALL USING (true) WITH CHECK (true);
