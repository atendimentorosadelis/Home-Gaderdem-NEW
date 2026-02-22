-- Create table to track affiliate banner clicks
CREATE TABLE public.affiliate_banner_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_affiliate_clicks_article_id ON public.affiliate_banner_clicks(article_id);
CREATE INDEX idx_affiliate_clicks_clicked_at ON public.affiliate_banner_clicks(clicked_at);

-- Enable RLS
ALTER TABLE public.affiliate_banner_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert clicks (anonymous tracking)
CREATE POLICY "Anyone can register clicks" 
ON public.affiliate_banner_clicks 
FOR INSERT 
WITH CHECK (true);

-- Policy: Only admins can view clicks
CREATE POLICY "Admins can view clicks" 
ON public.affiliate_banner_clicks 
FOR SELECT 
USING (is_current_user_admin());

-- Add click count column to content_articles for quick access
ALTER TABLE public.content_articles
ADD COLUMN IF NOT EXISTS affiliate_clicks_count INTEGER NOT NULL DEFAULT 0;

-- Create function to increment click count
CREATE OR REPLACE FUNCTION public.register_affiliate_click(p_article_id uuid, p_ip_hash text, p_user_agent text DEFAULT NULL, p_referrer text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert the click record
  INSERT INTO affiliate_banner_clicks (article_id, ip_hash, user_agent, referrer)
  VALUES (p_article_id, p_ip_hash, p_user_agent, p_referrer);
  
  -- Increment the counter on the article
  UPDATE content_articles 
  SET affiliate_clicks_count = affiliate_clicks_count + 1
  WHERE id = p_article_id
  RETURNING affiliate_clicks_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.register_affiliate_click TO anon, authenticated;