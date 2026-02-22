-- Create table for newsletter send history
CREATE TABLE public.newsletter_send_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.content_articles(id) ON DELETE SET NULL,
  article_title TEXT NOT NULL,
  article_slug TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  successful_sends INTEGER NOT NULL DEFAULT 0,
  failed_sends INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create table for individual email tracking
CREATE TABLE public.newsletter_email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_history_id UUID NOT NULL REFERENCES public.newsletter_send_history(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  tracking_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'sent'
);

-- Enable RLS
ALTER TABLE public.newsletter_send_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_email_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for newsletter_send_history
CREATE POLICY "Admins can view send history"
  ON public.newsletter_send_history
  FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage send history"
  ON public.newsletter_send_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for newsletter_email_tracking  
CREATE POLICY "Admins can view email tracking"
  ON public.newsletter_email_tracking
  FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage email tracking"
  ON public.newsletter_email_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can update tracking via token"
  ON public.newsletter_email_tracking
  FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_newsletter_send_history_sent_at ON public.newsletter_send_history(sent_at DESC);
CREATE INDEX idx_newsletter_email_tracking_token ON public.newsletter_email_tracking(tracking_token);
CREATE INDEX idx_newsletter_email_tracking_history ON public.newsletter_email_tracking(send_history_id);