-- Create backup bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images-backup', 'article-images-backup', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for backup bucket - only admins and service role can access
CREATE POLICY "Admins can view backups"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images-backup' AND public.is_current_user_admin());

CREATE POLICY "Service role can manage backups"
ON storage.objects FOR ALL
USING (bucket_id = 'article-images-backup' AND auth.role() = 'service_role');

-- Create table to track backup history
CREATE TABLE IF NOT EXISTS public.image_backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_images INTEGER NOT NULL DEFAULT 0,
  backed_up INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  duration_ms INTEGER
);

-- Enable RLS on backup logs
ALTER TABLE public.image_backup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view backup logs
CREATE POLICY "Admins can view backup logs"
ON public.image_backup_logs FOR SELECT
USING (public.is_current_user_admin());

-- Service role can manage backup logs
CREATE POLICY "Service role can manage backup logs"
ON public.image_backup_logs FOR ALL
USING (auth.role() = 'service_role');