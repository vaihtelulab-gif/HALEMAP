-- Add start_at and end_at columns to projects table (minute-level scheduling)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS start_at timestamptz;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS end_at timestamptz;

-- Backfill from existing date-only fields when present.
-- start_date -> start_at (00:00)
UPDATE public.projects
SET start_at = (start_date::timestamp AT TIME ZONE 'UTC')
WHERE start_at IS NULL AND start_date IS NOT NULL;

-- end_date -> end_at (23:59)
UPDATE public.projects
SET end_at = ((end_date::timestamp + interval '23 hours 59 minutes') AT TIME ZONE 'UTC')
WHERE end_at IS NULL AND end_date IS NOT NULL;

