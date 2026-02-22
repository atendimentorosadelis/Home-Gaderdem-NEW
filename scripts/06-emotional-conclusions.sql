-- ============================================================================
-- MIGRATION: Create article_emotional_conclusions table
-- Run this script in the EXTERNAL Supabase SQL Editor (lhtetfcujdzulfyekiub)
-- ============================================================================

-- Table to store emotional conclusions for articles
CREATE TABLE IF NOT EXISTS public.article_emotional_conclusions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL UNIQUE,
  conclusion_text text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES public.content_articles(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_emotional_conclusions_article_id ON public.article_emotional_conclusions(article_id);

-- Enable RLS
ALTER TABLE public.article_emotional_conclusions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read" ON public.article_emotional_conclusions
  FOR SELECT USING (true);

-- Policy: Allow service_role to manage (for Edge Functions)
CREATE POLICY "Allow service_role full access" ON public.article_emotional_conclusions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow authenticated admins to manage
CREATE POLICY "Allow admin insert" ON public.article_emotional_conclusions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin update" ON public.article_emotional_conclusions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin delete" ON public.article_emotional_conclusions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.article_emotional_conclusions;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
