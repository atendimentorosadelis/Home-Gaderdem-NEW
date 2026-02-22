import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AffiliateClickStats {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: { date: string; clicks: number }[];
}

// Hook to register a click on an affiliate banner
export function useRegisterAffiliateClick() {
  return useMutation({
    mutationFn: async (articleId: string) => {
      // Generate a session-based hash for the user
      const sessionHash = btoa(navigator.userAgent + new Date().toDateString());
      
      const { data, error } = await supabase.rpc('register_affiliate_click', {
        p_article_id: articleId,
        p_ip_hash: sessionHash,
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer || null,
      });

      if (error) {
        console.error('Error registering affiliate click:', error);
        throw error;
      }

      return data as number;
    },
  });
}

// Hook to get affiliate click stats for an article (admin only)
export function useAffiliateClickStats(articleId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: ['affiliate-clicks', articleId, days],
    queryFn: async (): Promise<AffiliateClickStats> => {
      if (!articleId) {
        return { totalClicks: 0, uniqueClicks: 0, clicksByDay: [] };
      }

      // Get all clicks for this article in the period
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: clicks, error } = await supabase
        .from('affiliate_banner_clicks')
        .select('*')
        .eq('article_id', articleId)
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) {
        console.error('Error fetching affiliate clicks:', error);
        throw error;
      }

      const totalClicks = clicks?.length || 0;
      
      // Calculate unique clicks by IP hash
      const uniqueIps = new Set(clicks?.map(c => c.ip_hash) || []);
      const uniqueClicks = uniqueIps.size;

      // Calculate clicks by day
      const clicksByDayMap = new Map<string, number>();
      
      // Initialize all days in the period
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        clicksByDayMap.set(dateStr, 0);
      }

      // Count clicks per day
      clicks?.forEach(click => {
        const dateStr = new Date(click.clicked_at).toISOString().split('T')[0];
        clicksByDayMap.set(dateStr, (clicksByDayMap.get(dateStr) || 0) + 1);
      });

      const clicksByDay = Array.from(clicksByDayMap.entries()).map(([date, clicks]) => ({
        date,
        clicks,
      }));

      return { totalClicks, uniqueClicks, clicksByDay };
    },
    enabled: !!articleId,
  });
}

// Hook to get affiliate stats for all articles (admin dashboard)
export function useAllAffiliateStats(days: number = 30) {
  return useQuery({
    queryKey: ['all-affiliate-stats', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get articles with affiliate banners enabled
      const { data: articles, error: articlesError } = await supabase
        .from('content_articles')
        .select('id, title, slug, affiliate_clicks_count, affiliate_banner_enabled')
        .eq('affiliate_banner_enabled', true)
        .order('affiliate_clicks_count', { ascending: false });

      if (articlesError) throw articlesError;

      // Get recent clicks
      const { data: recentClicks, error: clicksError } = await supabase
        .from('affiliate_banner_clicks')
        .select('article_id, clicked_at')
        .gte('clicked_at', startDate.toISOString());

      if (clicksError) throw clicksError;

      // Calculate stats per article
      const stats = articles?.map(article => {
        const articleClicks = recentClicks?.filter(c => c.article_id === article.id) || [];
        return {
          ...article,
          recentClicks: articleClicks.length,
        };
      }) || [];

      // Total clicks in period
      const totalRecentClicks = recentClicks?.length || 0;

      return {
        articles: stats,
        totalRecentClicks,
        totalArticlesWithBanner: articles?.length || 0,
      };
    },
  });
}
