-- Create image generation queue table
CREATE TABLE public.image_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.content_articles(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('cover', 'gallery')),
  image_index INTEGER DEFAULT 0,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  result_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_image_queue_status ON public.image_generation_queue(status);
CREATE INDEX idx_image_queue_next_retry ON public.image_generation_queue(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_image_queue_article ON public.image_generation_queue(article_id);
CREATE INDEX idx_image_queue_pending ON public.image_generation_queue(created_at) WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_image_generation_queue_updated_at
  BEFORE UPDATE ON public.image_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.image_generation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all queue items"
  ON public.image_generation_queue
  FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Service role bypass for edge functions"
  ON public.image_generation_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime for queue status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.image_generation_queue;