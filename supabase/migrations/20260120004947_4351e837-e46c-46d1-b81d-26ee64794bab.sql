-- Add likes_count column to content_articles
ALTER TABLE public.content_articles 
ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- Create table to track individual likes (prevents duplicate likes)
CREATE TABLE public.article_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.content_articles(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, ip_hash)
);

-- Enable RLS
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes count (through content_articles)
CREATE POLICY "Anyone can insert likes"
ON public.article_likes
FOR INSERT
WITH CHECK (true);

-- Prevent reading individual likes (privacy)
CREATE POLICY "Admins can view likes"
ON public.article_likes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to increment likes
CREATE OR REPLACE FUNCTION public.increment_article_likes(p_article_id UUID, p_ip_hash TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Try to insert the like (will fail if already exists due to UNIQUE constraint)
  INSERT INTO article_likes (article_id, ip_hash)
  VALUES (p_article_id, p_ip_hash);
  
  -- Increment the counter
  UPDATE content_articles 
  SET likes_count = likes_count + 1
  WHERE id = p_article_id
  RETURNING likes_count INTO new_count;
  
  RETURN new_count;
EXCEPTION
  WHEN unique_violation THEN
    -- Already liked, return current count
    SELECT likes_count INTO new_count FROM content_articles WHERE id = p_article_id;
    RETURN new_count;
END;
$$;