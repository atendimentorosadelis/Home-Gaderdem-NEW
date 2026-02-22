-- Create generation_history table
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  article_title TEXT,
  article_id UUID REFERENCES public.content_articles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view own history"
ON public.generation_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert own history"
ON public.generation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own history"
ON public.generation_history
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all history
CREATE POLICY "Admins can manage all history"
ON public.generation_history
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);