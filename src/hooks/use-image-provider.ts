import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type ImageProvider = 'auto' | 'replicate' | 'cloudflare';

export function useImageProvider() {
  const [provider, setProvider] = useState<ImageProvider>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'ai_settings')
          .maybeSingle();

        if (!error && data?.value) {
          const settings = data.value as { image_provider?: ImageProvider };
          setProvider(settings.image_provider || 'auto');
        }
      } catch (e) {
        console.error('Failed to fetch image provider:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, []);

  const getProviderLabel = (): string => {
    switch (provider) {
      case 'replicate':
        return 'Replicate';
      case 'cloudflare':
        return 'Cloudflare AI';
      case 'auto':
      default:
        return 'Automático (Replicate → Cloudflare)';
    }
  };

  const getProviderShortLabel = (): string => {
    switch (provider) {
      case 'replicate':
        return 'Replicate';
      case 'cloudflare':
        return 'Cloudflare';
      case 'auto':
      default:
        return 'Auto';
    }
  };

  return {
    provider,
    isLoading,
    getProviderLabel,
    getProviderShortLabel,
  };
}
