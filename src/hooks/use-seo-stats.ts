import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SEOCriteria {
  hasKeywords: boolean;
  hasExcerpt: boolean;
  hasOptimalExcerpt: boolean;
  hasCoverImage: boolean;
  hasOptimalContent: boolean;
}

interface ArticleSEO {
  id: string;
  title: string;
  slug: string | null;
  score: number;
  criteria: SEOCriteria;
  views: number;
  published_at: string | null;
}

interface SEOStats {
  overallScore: number;
  totalArticles: number;
  criteriaPercentages: {
    keywords: number;
    excerpt: number;
    coverImage: number;
    content: number;
  };
  topKeywords: { keyword: string; count: number }[];
  articlesSEO: ArticleSEO[];
}

const EXCERPT_MIN_LENGTH = 120;
const EXCERPT_MAX_LENGTH = 160;
const CONTENT_MIN_LENGTH = 3000;

function calculateArticleSEOScore(article: {
  keywords: string | null;
  excerpt: string | null;
  cover_image: string | null;
  body: string | null;
}): { score: number; criteria: SEOCriteria } {
  let score = 0;
  
  const hasKeywords = !!(article.keywords && article.keywords.trim().length > 0);
  const hasExcerpt = !!(article.excerpt && article.excerpt.trim().length > 0);
  const hasOptimalExcerpt = !!(article.excerpt && 
    article.excerpt.length >= EXCERPT_MIN_LENGTH && 
    article.excerpt.length <= EXCERPT_MAX_LENGTH);
  const hasCoverImage = !!(article.cover_image && article.cover_image.trim().length > 0);
  const hasOptimalContent = !!(article.body && article.body.length >= CONTENT_MIN_LENGTH);

  if (hasKeywords) score += 25;
  if (hasOptimalExcerpt) score += 25;
  else if (hasExcerpt) score += 15;
  if (hasCoverImage) score += 25;
  if (hasOptimalContent) score += 25;

  return {
    score,
    criteria: {
      hasKeywords,
      hasExcerpt,
      hasOptimalExcerpt,
      hasCoverImage,
      hasOptimalContent,
    },
  };
}

function extractKeywords(keywordsString: string | null): string[] {
  if (!keywordsString) return [];
  return keywordsString
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);
}

export function useSEOStats() {
  return useQuery({
    queryKey: ['seo-stats'],
    queryFn: async (): Promise<SEOStats> => {
      // Fetch all published articles with SEO-relevant fields
      const { data: articles, error } = await supabase
        .from('content_articles')
        .select('id, title, slug, keywords, excerpt, cover_image, body, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      if (!articles || articles.length === 0) {
        return {
          overallScore: 0,
          totalArticles: 0,
          criteriaPercentages: {
            keywords: 0,
            excerpt: 0,
            coverImage: 0,
            content: 0,
          },
          topKeywords: [],
          articlesSEO: [],
        };
      }

      // Fetch views count for each article
      const { data: viewsData } = await supabase
        .from('article_views')
        .select('article_id');

      const viewsCount: Record<string, number> = {};
      viewsData?.forEach(view => {
        viewsCount[view.article_id] = (viewsCount[view.article_id] || 0) + 1;
      });

      // Calculate SEO scores for each article
      const articlesSEO: ArticleSEO[] = articles.map(article => {
        const { score, criteria } = calculateArticleSEOScore(article);
        return {
          id: article.id,
          title: article.title,
          slug: article.slug,
          score,
          criteria,
          views: viewsCount[article.id] || 0,
          published_at: article.published_at,
        };
      });

      // Calculate overall score
      const totalScore = articlesSEO.reduce((sum, a) => sum + a.score, 0);
      const overallScore = Math.round(totalScore / articles.length);

      // Calculate criteria percentages
      const withKeywords = articlesSEO.filter(a => a.criteria.hasKeywords).length;
      const withExcerpt = articlesSEO.filter(a => a.criteria.hasOptimalExcerpt).length;
      const withCoverImage = articlesSEO.filter(a => a.criteria.hasCoverImage).length;
      const withContent = articlesSEO.filter(a => a.criteria.hasOptimalContent).length;

      const criteriaPercentages = {
        keywords: Math.round((withKeywords / articles.length) * 100),
        excerpt: Math.round((withExcerpt / articles.length) * 100),
        coverImage: Math.round((withCoverImage / articles.length) * 100),
        content: Math.round((withContent / articles.length) * 100),
      };

      // Extract and count keywords
      const keywordCounts: Record<string, number> = {};
      articles.forEach(article => {
        const keywords = extractKeywords(article.keywords);
        keywords.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      });

      const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      return {
        overallScore,
        totalArticles: articles.length,
        criteriaPercentages,
        topKeywords,
        articlesSEO: articlesSEO.sort((a, b) => b.score - a.score),
      };
    },
  });
}
