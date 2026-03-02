-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by text NOT NULL REFERENCES public.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create project_members table
CREATE TABLE public.project_members (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Add project_id to spots table
ALTER TABLE public.spots ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to reports table (Optional but good for performance/RLS later)
-- For now, we rely on spot.project_id, but adding it makes queries easier.
-- Let's stick to normalized for now to avoid complexity in migration.

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now as per MVP)
CREATE POLICY "Allow all operations for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for project_members" ON public.project_members FOR ALL USING (true) WITH CHECK (true);
