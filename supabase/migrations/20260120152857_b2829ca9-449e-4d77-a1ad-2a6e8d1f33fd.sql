-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'footer',
  ip_hash TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (is_current_user_admin());

-- Admins can update subscribers
CREATE POLICY "Admins can update subscribers"
ON public.newsletter_subscribers
FOR UPDATE
USING (is_current_user_admin());

-- Admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
USING (is_current_user_admin());

-- Service role can manage subscribers
CREATE POLICY "Service role can manage subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (auth.role() = 'service_role');

-- Create index for email lookups
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- Create index for active subscribers
CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(is_active) WHERE is_active = true;