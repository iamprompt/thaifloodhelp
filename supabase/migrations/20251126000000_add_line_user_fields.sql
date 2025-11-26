-- Add LINE user fields for LIFF integration
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS line_user_id text,
ADD COLUMN IF NOT EXISTS line_display_name text;

-- Add index for line_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_line_user_id ON public.reports(line_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.reports.line_user_id IS 'LINE User ID from LIFF login';
COMMENT ON COLUMN public.reports.line_display_name IS 'LINE Display Name from LIFF profile';
