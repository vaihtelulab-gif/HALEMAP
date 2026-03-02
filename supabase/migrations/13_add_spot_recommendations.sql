-- Spot recommendations (ParkMate "おすすめスポット")

CREATE TABLE IF NOT EXISTS public.spot_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  spot_id uuid NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spot_recommendations_project_id_idx
  ON public.spot_recommendations(project_id);

ALTER TABLE public.spot_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for spot_recommendations"
  ON public.spot_recommendations FOR ALL
  USING (true) WITH CHECK (true);

