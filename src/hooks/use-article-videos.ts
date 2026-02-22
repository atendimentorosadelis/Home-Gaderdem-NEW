import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction, EDGE_FUNCTIONS } from '@/lib/edge-functions';
import { toast } from 'sonner';

export interface ArticleVideo {
  id: string;
  article_id: string;
  youtube_video_id: string;
  youtube_url: string;
  video_title: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithVideo {
  id: string;
  title: string;
  slug: string;
  category_slug: string;
  status: string;
  published_at: string | null;
  video: ArticleVideo | null;
}

export interface VideoSettings {
  enabled: boolean;
  daily_limit: number;
}

export function useArticleVideos() {
  const [videos, setVideos] = useState<ArticleVideo[]>([]);
  const [articlesWithVideos, setArticlesWithVideos] = useState<ArticleWithVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<VideoSettings>({ enabled: false, daily_limit: 10 });

  // Fetch all videos using raw query
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch videos using raw RPC or direct fetch
      const { data: videosData, error: videosError } = await supabase
        .from('article_videos' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        // Table might not exist yet
        setVideos([]);
      } else {
        setVideos((videosData as unknown as ArticleVideo[]) || []);
      }

      // Fetch articles with video status
      const { data: articlesData, error: articlesError } = await supabase
        .from('content_articles')
        .select('id, title, slug, category_slug, status, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Map articles with their videos
      const videoMap = new Map((videosData as unknown as ArticleVideo[] || []).map(v => [v.article_id, v]));
      const mapped: ArticleWithVideo[] = (articlesData || []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug || '',
        category_slug: article.category_slug || '',
        status: article.status || 'published',
        published_at: article.published_at,
        video: videoMap.get(article.id) || null,
      }));

      setArticlesWithVideos(mapped);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'video_auto_generation')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error fetching video settings:', error);
    }
  }, []);

  // Toggle global enabled
  const toggleGlobalEnabled = async (enabled: boolean) => {
    try {
      const newSettings = { ...settings, enabled };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'video_auto_generation',
          value: newSettings as any,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;

      setSettings(newSettings);
      toast.success(enabled ? 'Geração automática ativada' : 'Geração automática desativada');
    } catch (error) {
      console.error('Error toggling video generation:', error);
      toast.error('Erro ao alterar configuração');
    }
  };

  // Update daily limit
  const updateDailyLimit = async (limit: number) => {
    try {
      const newSettings = { ...settings, daily_limit: limit };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'video_auto_generation',
          value: newSettings as any,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Limite diário atualizado');
    } catch (error) {
      console.error('Error updating daily limit:', error);
      toast.error('Erro ao atualizar limite');
    }
  };

  // Toggle individual video visibility
  const toggleVideoEnabled = async (articleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('article_videos' as any)
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('article_id', articleId);

      if (error) throw error;

      setVideos(prev => prev.map(v => 
        v.article_id === articleId ? { ...v, is_enabled: enabled } : v
      ));
      setArticlesWithVideos(prev => prev.map(a => 
        a.id === articleId && a.video ? { ...a, video: { ...a.video, is_enabled: enabled } } : a
      ));

      toast.success(enabled ? 'Vídeo ativado' : 'Vídeo desativado');
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Erro ao alterar visibilidade');
    }
  };

  // Regenerate video for article
  const regenerateVideo = async (articleId: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await invokeEdgeFunction(EDGE_FUNCTIONS.SEARCH_YOUTUBE_VIDEO, {
        articleId,
        saveToDb: true,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Vídeo encontrado: ${data.videoTitle}`);
        await fetchVideos();
      } else {
        throw new Error(data?.error || 'Falha ao buscar vídeo');
      }
    } catch (error) {
      console.error('Error regenerating video:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao regenerar vídeo');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete video
  const deleteVideo = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('article_videos' as any)
        .delete()
        .eq('article_id', articleId);

      if (error) throw error;

      setVideos(prev => prev.filter(v => v.article_id !== articleId));
      setArticlesWithVideos(prev => prev.map(a => 
        a.id === articleId ? { ...a, video: null } : a
      ));

      toast.success('Vídeo removido');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao remover vídeo');
    }
  };

  // Process queue (find videos for articles without)
  const processQueue = async (batchSize: number = 5) => {
    setIsProcessing(true);
    try {
      const { data, error } = await invokeEdgeFunction(EDGE_FUNCTIONS.PROCESS_VIDEO_QUEUE, {
        batchSize,
        force: true,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Processados: ${data.successful}/${data.processed} artigos`);
        await fetchVideos();
      } else {
        throw new Error(data?.error || 'Falha ao processar fila');
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar fila');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get video for specific article
  const getVideoForArticle = async (articleId: string): Promise<ArticleVideo | null> => {
    try {
      const { data, error } = await supabase
        .from('article_videos' as any)
        .select('*')
        .eq('article_id', articleId)
        .eq('is_enabled', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ArticleVideo | null;
    } catch (error) {
      console.error('Error fetching video for article:', error);
      return null;
    }
  };

  // Get stats
  const getStats = useCallback(() => {
    const withVideo = articlesWithVideos.filter(a => a.video !== null).length;
    const withoutVideo = articlesWithVideos.filter(a => a.video === null).length;
    const enabledVideos = videos.filter(v => v.is_enabled).length;
    const disabledVideos = videos.filter(v => !v.is_enabled).length;

    return {
      total: articlesWithVideos.length,
      withVideo,
      withoutVideo,
      enabledVideos,
      disabledVideos,
    };
  }, [articlesWithVideos, videos]);

  // Initial fetch
  useEffect(() => {
    fetchVideos();
    fetchSettings();
  }, [fetchVideos, fetchSettings]);

  return {
    videos,
    articlesWithVideos,
    settings,
    isLoading,
    isProcessing,
    fetchVideos,
    toggleGlobalEnabled,
    updateDailyLimit,
    toggleVideoEnabled,
    regenerateVideo,
    deleteVideo,
    processQueue,
    getVideoForArticle,
    getStats,
  };
}

// Simple hook for public article video display
export function useArticleVideo(articleId: string | undefined) {
  const [video, setVideo] = useState<ArticleVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setIsLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('article_videos' as any)
          .select('*')
          .eq('article_id', articleId)
          .eq('is_enabled', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        setVideo(data as unknown as ArticleVideo | null);
      } catch (error) {
        console.error('Error fetching article video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [articleId]);

  return { video, isLoading };
}
