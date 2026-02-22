-- Create article_views table to track article views
CREATE TABLE public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.content_articles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hash TEXT
);

-- Enable RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (register a view)
CREATE POLICY "Anyone can register views"
ON public.article_views
FOR INSERT
WITH CHECK (true);

-- Only admins can read view data
CREATE POLICY "Admins can read views"
ON public.article_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX idx_article_views_viewed_at ON public.article_views(viewed_at);