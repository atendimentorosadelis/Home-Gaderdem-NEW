-- Create table for message replies
CREATE TABLE public.contact_message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  replied_by UUID NOT NULL,
  replied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_ai_generated BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false
);

-- Create table for site settings (auto-reply toggle, prompts, etc.)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.contact_message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for contact_message_replies
CREATE POLICY "Admins can view all replies"
ON public.contact_message_replies
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can insert replies"
ON public.contact_message_replies
FOR INSERT
WITH CHECK (is_current_user_admin());

CREATE POLICY "Service role can manage replies"
ON public.contact_message_replies
FOR ALL
USING (auth.role() = 'service_role');

-- RLS policies for site_settings
CREATE POLICY "Admins can view settings"
ON public.site_settings
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can insert settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update settings"
ON public.site_settings
FOR UPDATE
USING (is_current_user_admin());

CREATE POLICY "Service role can manage settings"
ON public.site_settings
FOR ALL
USING (auth.role() = 'service_role');

-- Insert default auto-reply setting
INSERT INTO public.site_settings (key, value)
VALUES ('auto_reply_config', '{"enabled": false, "prompt": "Você é um assistente do site Home Garden Manual, especializado em jardinagem e decoração. Responda de forma profissional e amigável em português brasileiro."}'::jsonb);

-- Create index for faster lookups
CREATE INDEX idx_contact_message_replies_message_id ON public.contact_message_replies(message_id);
CREATE INDEX idx_site_settings_key ON public.site_settings(key);