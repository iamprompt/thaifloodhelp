-- Create help_requests table for victims posting their needs
CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  help_types TEXT[] DEFAULT '{}',
  budget TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT[],
  contact_method TEXT,
  location_address TEXT,
  location_lat NUMERIC,
  location_long NUMERIC,
  image_urls TEXT[],
  status TEXT DEFAULT 'open',
  CHECK (status IN ('open', 'in_progress', 'closed'))
);

-- Create help_offers table for volunteers/helpers posting their services
CREATE TABLE public.help_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  services_offered TEXT[] DEFAULT '{}',
  capacity TEXT,
  contact_info TEXT NOT NULL,
  contact_method TEXT,
  availability TEXT,
  location_area TEXT,
  skills TEXT,
  status TEXT DEFAULT 'available',
  CHECK (status IN ('available', 'unavailable'))
);

-- Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_requests
CREATE POLICY "Anyone can view help requests"
ON public.help_requests
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create help requests"
ON public.help_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own help requests"
ON public.help_requests
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update any help request"
ON public.help_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for help_offers
CREATE POLICY "Anyone can view help offers"
ON public.help_offers
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create help offers"
ON public.help_offers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own help offers"
ON public.help_offers
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update any help offer"
ON public.help_offers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON public.help_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_offers_updated_at
BEFORE UPDATE ON public.help_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_help_requests_status ON public.help_requests(status);
CREATE INDEX idx_help_requests_created_at ON public.help_requests(created_at DESC);
CREATE INDEX idx_help_offers_status ON public.help_offers(status);
CREATE INDEX idx_help_offers_created_at ON public.help_offers(created_at DESC);