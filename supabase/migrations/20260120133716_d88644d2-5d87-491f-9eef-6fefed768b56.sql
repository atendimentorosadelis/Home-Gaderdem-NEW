-- Create article_images table for tracking all images
CREATE TABLE public.article_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.content_articles(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('cover', 'gallery')),
  image_index INTEGER DEFAULT 0,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  file_size INTEGER,
  format TEXT DEFAULT 'webp',
  width INTEGER,
  height INTEGER,
  original_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_article_images_article_id ON public.article_images(article_id);
CREATE INDEX idx_article_images_type ON public.article_images(image_type);

-- Enable RLS
ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can manage all images
CREATE POLICY "Admins can manage all images"
ON public.article_images
FOR ALL
USING (is_current_user_admin());

-- Anyone can view images of published articles
CREATE POLICY "Anyone can view images of published articles"
ON public.article_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content_articles
    WHERE content_articles.id = article_images.article_id
    AND content_articles.status = 'published'
    AND content_articles.published_at IS NOT NULL
  )
);

-- Service role can manage images (for edge functions)
CREATE POLICY "Service role can manage images"
ON public.article_images
FOR ALL
USING (auth.role() = 'service_role');