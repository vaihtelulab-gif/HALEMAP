-- Add map_config column to projects table
ALTER TABLE public.projects ADD COLUMN map_config jsonb;
