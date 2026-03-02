-- Project visibility
ALTER TABLE public.projects
ADD COLUMN visibility text NOT NULL DEFAULT 'private';

ALTER TABLE public.projects
ADD CONSTRAINT projects_visibility_check
CHECK (visibility IN ('public', 'private', 'secret', 'collaborate'));

-- Project join requests (for private/collaborate approval flow)
CREATE TABLE public.project_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.project_join_requests
ADD CONSTRAINT project_join_requests_status_check
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Only one pending request per (project, user)
CREATE UNIQUE INDEX project_join_requests_unique_pending
ON public.project_join_requests (project_id, user_id)
WHERE status = 'pending';

-- Enable RLS (MVP allows all operations like other tables)
ALTER TABLE public.project_join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for project_join_requests"
ON public.project_join_requests
FOR ALL
USING (true)
WITH CHECK (true);

