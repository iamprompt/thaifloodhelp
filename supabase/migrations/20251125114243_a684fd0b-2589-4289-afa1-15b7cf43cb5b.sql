-- Add help_categories column to reports table
ALTER TABLE public.reports 
ADD COLUMN help_categories text[] DEFAULT '{}';

COMMENT ON COLUMN public.reports.help_categories IS 'Categories of help needed (e.g., water, food, electricity, shelter, medical, evacuation)';