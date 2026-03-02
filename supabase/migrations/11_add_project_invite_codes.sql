-- Project invite codes (ParkMate-style join codes)
CREATE TABLE IF NOT EXISTS public.project_invite_codes (
  code text PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by text NOT NULL REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

ALTER TABLE public.project_invite_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for project_invite_codes"
  ON public.project_invite_codes FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS project_invite_codes_project_id_idx
  ON public.project_invite_codes(project_id);

