-- Allow "open project" operations without login (opt-in)
-- When open_access is true AND visibility is public, unauthenticated users may create spots/reports.

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS open_access boolean NOT NULL DEFAULT false;

