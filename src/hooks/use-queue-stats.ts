import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DailyStats {
  date: string;
  dateFormatted: string;
  total: number;
  cover: number;
  gallery: number;
}

export interface QueueStats {
  total: number;
  cover: number;
  gallery: number;
  webp: number;
  other: number;
  successRate: number;
  avgSizeKb: number;
  avgSizeFormatted: string;
  todayTotal: number;
  todayCover: number;
  todayGallery: number;
  recentItems: ImageItemSummary[];
  dailyHistory: DailyStats[];
}

export interface ImageItemSummary {
  id: string;
  article_id: string;
  article_title: string;
  image_type: 'cover' | 'gallery';
  format: string;
  file_size: number | null;
  public_url: string;
  created_at: string;
}

export function useQueueStats(days: number = 7) {
  return useQuery({
    queryKey: ['image-stats', days],
    queryFn: async (): Promise<QueueStats> => {
      const startDate = subDays(new Date(), days);
      
      // Fetch images from article_images table within the period
      const { data: items, error } = await supabase
        .from('article_images')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const images = items || [];
      
      // Calculate statistics
      const total = images.length;
      const cover = images.filter(i => i.image_type === 'cover').length;
      const gallery = images.filter(i => i.image_type === 'gallery').length;
      const webp = images.filter(i => i.format === 'webp').length;
      const other = images.filter(i => i.format !== 'webp').length;

      // Success rate (all images are successful since they're stored)
      const successRate = total > 0 ? 100 : 0;

      // Average size
      const imagesWithSize = images.filter(i => i.file_size && i.file_size > 0);
      let avgSizeKb = 0;
      
      if (imagesWithSize.length > 0) {
        const totalSize = imagesWithSize.reduce((sum, item) => sum + (item.file_size || 0), 0);
        avgSizeKb = totalSize / imagesWithSize.length / 1024;
      }

      // Format average size
      let avgSizeFormatted = '0 KB';
      if (avgSizeKb > 0) {
        if (avgSizeKb >= 1024) {
          avgSizeFormatted = `${(avgSizeKb / 1024).toFixed(1)} MB`;
        } else {
          avgSizeFormatted = `${avgSizeKb.toFixed(0)} KB`;
        }
      }

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayItems = images.filter(i => new Date(i.created_at) >= today);
      const todayTotal = todayItems.length;
      const todayCover = todayItems.filter(i => i.image_type === 'cover').length;
      const todayGallery = todayItems.filter(i => i.image_type === 'gallery').length;

      // Calculate daily history for the selected period
      const dailyHistory: DailyStats[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayItems = images.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= dayStart && itemDate <= dayEnd;
        });

        dailyHistory.push({
          date: format(date, 'yyyy-MM-dd'),
          dateFormatted: format(date, 'EEE', { locale: ptBR }),
          total: dayItems.length,
          cover: dayItems.filter(i => i.image_type === 'cover').length,
          gallery: dayItems.filter(i => i.image_type === 'gallery').length,
        });
      }

      // Get article titles for recent items
      const recentItems = images.slice(0, 20);
      const articleIds = [...new Set(recentItems.map(i => i.article_id))];
      
      const { data: articles } = await supabase
        .from('content_articles')
        .select('id, title')
        .in('id', articleIds);

      const articleMap = new Map((articles || []).map(a => [a.id, a.title]));

      const recentItemsWithTitles: ImageItemSummary[] = recentItems.map(item => ({
        id: item.id,
        article_id: item.article_id,
        article_title: articleMap.get(item.article_id) || 'Artigo desconhecido',
        image_type: item.image_type as 'cover' | 'gallery',
        format: item.format || 'unknown',
        file_size: item.file_size,
        public_url: item.public_url,
        created_at: item.created_at,
      }));

      return {
        total,
        cover,
        gallery,
        webp,
        other,
        successRate,
        avgSizeKb,
        avgSizeFormatted,
        todayTotal,
        todayCover,
        todayGallery,
        recentItems: recentItemsWithTitles,
        dailyHistory,
      };
    },
    refetchInterval: 10000,
  });
}
