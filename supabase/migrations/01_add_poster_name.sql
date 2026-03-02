-- Add current_poster_name to spots table
ALTER TABLE public.spots ADD COLUMN current_poster_name text;

-- Add poster_name to reports table
ALTER TABLE public.reports ADD COLUMN poster_name text;
