-- Add removal_deadline to reports and current_deadline to spots
ALTER TABLE public.reports ADD COLUMN removal_deadline date;
ALTER TABLE public.spots ADD COLUMN current_deadline date;
