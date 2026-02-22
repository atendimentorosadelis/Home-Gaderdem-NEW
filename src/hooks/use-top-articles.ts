import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TopArticle {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  published_at: string | null;
  views_count: number;
  likes_count: number;
}

export function useTopViewedArticles(limit = 10) {
  return useQuery({
    queryKey: ['top-viewed-articles', limit],
    queryFn: async (): Promise<TopArticle[]> => {
      // Get articles with view counts
      const { data: articles, error: articlesError } = await supabase
        .from('content_articles')
        .select('id, title, slug, category, published_at, likes_count')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Get view counts for each article
      const articleIds = articles?.map(a => a.id) || [];
      
      const { data: viewCounts, error: viewsError } = await supabase
        .from('article_views')
        .select('article_id')
        .in('article_id', articleIds);

      if (viewsError) throw viewsError;

      // Count views per article
      const viewsMap = new Map<string, number>();
      viewCounts?.forEach(v => {
        viewsMap.set(v.article_id, (viewsMap.get(v.article_id) || 0) + 1);
      });

      // Combine data and sort by views
      const result: TopArticle[] = (articles || []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        published_at: article.published_at,
        views_count: viewsMap.get(article.id) || 0,
        likes_count: article.likes_count || 0,
      }));

      // Sort by views descending and limit
      return result
        .sort((a, b) => b.views_count - a.views_count)
        .slice(0, limit);
    },
  });
}

export function useTopLikedArticles(limit = 10) {
  return useQuery({
    queryKey: ['top-liked-articles', limit],
    queryFn: async (): Promise<TopArticle[]> => {
      // Get articles with like counts, sorted by likes
      const { data: articles, error: articlesError } = await supabase
        .from('content_articles')
        .select('id, title, slug, category, published_at, likes_count')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (articlesError) throw articlesError;

      // Get view counts for each article
      const articleIds = articles?.map(a => a.id) || [];
      
      const { data: viewCounts, error: viewsError } = await supabase
        .from('article_views')
        .select('article_id')
        .in('article_id', articleIds);

      if (viewsError) throw viewsError;

      // Count views per article
      const viewsMap = new Map<string, number>();
      viewCounts?.forEach(v => {
        viewsMap.set(v.article_id, (viewsMap.get(v.article_id) || 0) + 1);
      });

      // Combine data
      return (articles || []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        published_at: article.published_at,
        views_count: viewsMap.get(article.id) || 0,
        likes_count: article.likes_count || 0,
      }));
    },
  });
}
