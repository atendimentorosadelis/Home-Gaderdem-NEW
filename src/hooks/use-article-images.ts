import { useState, useEffect } from 'react';
import { invokeEdgeFunction } from '@/lib/edge-functions';

interface UseArticleImagesProps {
  postId: string;
  title: string;
  category: string;
  tags: string[];
  count?: number;
}

interface GeneratedImage {
  url: string;
  prompt: string;
}

const CACHE_KEY_PREFIX = 'article_images_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useArticleImages({ postId, title, category, tags, count = 6 }: UseArticleImagesProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Don't fetch if title is empty
    if (!title || !postId) {
      setIsLoading(false);
      return;
    }

    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `${CACHE_KEY_PREFIX}${postId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { images: cachedImages, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('Using cached images for', postId);
            setImages(cachedImages);
            setIsLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      // Generate new images
      const generatedImages: GeneratedImage[] = [];
      
      // Generate images with different prompts
      const prompts = [
        title,
        `${title} inspiração visual`,
        `${title} design moderno`,
        `${title} estilo contemporâneo`,
        `${title} decoração elegante`,
        `${title} ambiente acolhedor`
      ].slice(0, count);

      for (const prompt of prompts) {
        try {
          const { data, error: fnError } = await invokeEdgeFunction('generate-article-image', { 
            title: prompt, 
            category, 
            tags 
          });

          if (fnError) {
            console.error('Edge function error:', fnError);
            continue;
          }

          if (data?.success && data?.imageUrl) {
            generatedImages.push({
              url: data.imageUrl,
              prompt: data.prompt
            });
          }
        } catch (err) {
          console.error('Error generating image:', err);
        }
      }

      if (generatedImages.length > 0) {
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify({
          images: generatedImages,
          timestamp: Date.now()
        }));
        setImages(generatedImages);
      } else {
        setError('Não foi possível gerar as imagens');
      }

      setIsLoading(false);
    };

    fetchImages();
  }, [postId, title, category, count, refreshKey]);

  const regenerate = () => {
    const cacheKey = `${CACHE_KEY_PREFIX}${postId}`;
    localStorage.removeItem(cacheKey);
    setImages([]);
    setRefreshKey(prev => prev + 1);
  };

  return { images, isLoading, error, regenerate };
}
