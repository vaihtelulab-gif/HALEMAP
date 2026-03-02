-- Spot presence (check-in / check-out) and visit plans (AM/PM)

CREATE TABLE IF NOT EXISTS public.spot_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  spot_id uuid NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checked_in_at timestamptz DEFAULT now(),
  checked_out_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spot_checkins_project_id_idx
  ON public.spot_checkins(project_id);
CREATE INDEX IF NOT EXISTS spot_checkins_spot_id_idx
  ON public.spot_checkins(spot_id);
CREATE INDEX IF NOT EXISTS spot_checkins_user_id_active_idx
  ON public.spot_checkins(user_id)
  WHERE checked_out_at IS NULL;

ALTER TABLE public.spot_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for spot_checkins"
  ON public.spot_checkins FOR ALL
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.spot_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  spot_id uuid NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('am','pm')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- One plan per user per day per slot
CREATE UNIQUE INDEX IF NOT EXISTS spot_plans_unique_user_day_slot
  ON public.spot_plans(user_id, plan_date, slot);

CREATE INDEX IF NOT EXISTS spot_plans_project_date_idx
  ON public.spot_plans(project_id, plan_date);

ALTER TABLE public.spot_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for spot_plans"
  ON public.spot_plans FOR ALL
  USING (true) WITH CHECK (true);

