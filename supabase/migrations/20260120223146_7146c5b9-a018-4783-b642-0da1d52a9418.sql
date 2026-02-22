-- Add mobile banner image column to content_articles
ALTER TABLE public.content_articles
ADD COLUMN IF NOT EXISTS affiliate_banner_image_mobile TEXT;