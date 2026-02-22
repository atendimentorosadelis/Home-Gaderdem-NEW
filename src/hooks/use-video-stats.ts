import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface VideoStats {
  totalVideos: number;
  enabledVideos: number;
  disabledVideos: number;
  articlesWithVideo: number;
  articlesWithoutVideo: number;
  videosAddedToday: number;
  videosAddedThisWeek: number;
  videosAddedThisMonth: number;
  coveragePercentage: number;
}

export function useVideoStats() {
  return useQuery({
    queryKey: ['video-stats'],
    queryFn: async (): Promise<VideoStats> => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all videos
      const { data: videos, error: videosError } = await supabase
        .from('article_videos' as any)
        .select('id, article_id, is_enabled, created_at');

      if (videosError && videosError.code !== 'PGRST116') {
        console.error('Error fetching video stats:', videosError);
      }

      // Fetch total published articles count
      const { count: totalArticles, error: articlesError } = await supabase
        .from('content_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

      if (articlesError) {
        console.error('Error fetching articles count:', articlesError);
      }

      const videoList = (videos as any[]) || [];
      const totalVideos = videoList.length;
      const enabledVideos = videoList.filter(v => v.is_enabled).length;
      const disabledVideos = videoList.filter(v => !v.is_enabled).length;
      
      const videosAddedToday = videoList.filter(v => 
        new Date(v.created_at) >= new Date(startOfToday)
      ).length;
      
      const videosAddedThisWeek = videoList.filter(v => 
        new Date(v.created_at) >= new Date(startOfWeek)
      ).length;
      
      const videosAddedThisMonth = videoList.filter(v => 
        new Date(v.created_at) >= new Date(startOfMonth)
      ).length;

      const totalArticlesCount = totalArticles || 0;
      const articlesWithVideo = totalVideos;
      const articlesWithoutVideo = Math.max(0, totalArticlesCount - totalVideos);
      const coveragePercentage = totalArticlesCount > 0 
        ? Math.round((totalVideos / totalArticlesCount) * 100) 
        : 0;

      return {
        totalVideos,
        enabledVideos,
        disabledVideos,
        articlesWithVideo,
        articlesWithoutVideo,
        videosAddedToday,
        videosAddedThisWeek,
        videosAddedThisMonth,
        coveragePercentage,
      };
    },
    staleTime: 30000, // 30 seconds
  });
}
