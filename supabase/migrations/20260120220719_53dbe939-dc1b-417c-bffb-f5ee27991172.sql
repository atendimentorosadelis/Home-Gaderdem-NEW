-- Add affiliate banner fields to content_articles
ALTER TABLE public.content_articles
ADD COLUMN IF NOT EXISTS affiliate_banner_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS affiliate_banner_image text,
ADD COLUMN IF NOT EXISTS affiliate_banner_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.content_articles.affiliate_banner_enabled IS 'Whether affiliate banner is enabled for this article';
COMMENT ON COLUMN public.content_articles.affiliate_banner_image IS 'URL of the affiliate banner image';
COMMENT ON COLUMN public.content_articles.affiliate_banner_url IS 'Affiliate link URL when banner is clicked';