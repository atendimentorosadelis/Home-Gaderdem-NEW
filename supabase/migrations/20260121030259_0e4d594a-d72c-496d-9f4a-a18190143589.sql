-- Create table to store commemorative date settings
CREATE TABLE public.commemorative_date_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_id text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.commemorative_date_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins can manage commemorative date settings"
ON public.commemorative_date_settings
FOR ALL
USING (is_current_user_admin());

-- Anyone can read settings (needed for the alert display)
CREATE POLICY "Anyone can read commemorative date settings"
ON public.commemorative_date_settings
FOR SELECT
USING (true);

-- Service role can manage settings
CREATE POLICY "Service role can manage commemorative date settings"
ON public.commemorative_date_settings
FOR ALL
USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_commemorative_date_settings_updated_at
BEFORE UPDATE ON public.commemorative_date_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for all dates (all enabled by default)
INSERT INTO public.commemorative_date_settings (date_id, is_enabled) VALUES
  ('ano-novo', true),
  ('carnaval', true),
  ('valentines-day', true),
  ('dia-mulher', true),
  ('st-patricks', true),
  ('pascoa', true),
  ('dia-maes', true),
  ('memorial-day', true),
  ('dia-namorados-br', true),
  ('festa-junina', true),
  ('independence-day-us', true),
  ('dia-pais', true),
  ('independencia-br', true),
  ('labor-day', true),
  ('dia-criancas', true),
  ('halloween', true),
  ('thanksgiving', true),
  ('natal', true);