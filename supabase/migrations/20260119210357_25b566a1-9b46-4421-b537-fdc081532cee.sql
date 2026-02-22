-- Add new columns to content_articles for full article generation
ALTER TABLE public.content_articles 
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'decoracao',
ADD COLUMN IF NOT EXISTS category_slug TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS keywords TEXT,
ADD COLUMN IF NOT EXISTS external_links JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create unique index on slug (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_articles_slug 
  ON public.content_articles(slug) WHERE slug IS NOT NULL;

-- Create policy for public viewing of published articles
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.content_articles;
CREATE POLICY "Anyone can view published articles" 
  ON public.content_articles
  FOR SELECT TO anon
  USING (status = 'published' AND published_at IS NOT NULL);