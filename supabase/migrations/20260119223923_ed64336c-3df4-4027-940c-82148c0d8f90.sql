-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to update images
CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to delete images
CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);