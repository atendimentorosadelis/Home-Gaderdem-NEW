import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { subDays, format } from 'date-fns';

interface SEOHistoryPoint {
  date: string;
  score: number;
  articlesCount: number;
}

interface SEORecommendation {
  articleId: string;
  articleTitle: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  score: number;
}

interface SEOAlert {
  id: string;
  type: 'missing_keywords' | 'missing_excerpt' | 'missing_image' | 'short_content' | 'incomplete';
  articleId: string;
  articleTitle: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  createdAt: string;
}

const EXCERPT_MIN_LENGTH = 120;
const EXCERPT_MAX_LENGTH = 160;
const CONTENT_MIN_LENGTH = 3000;

function calculateArticleSEOScore(article: {
  keywords: string | null;
  excerpt: string | null;
  cover_image: string | null;
  body: string | null;
}): number {
  let score = 0;
  
  if (article.keywords && article.keywords.trim().length > 0) score += 25;
  if (article.excerpt && article.excerpt.length >= EXCERPT_MIN_LENGTH && article.excerpt.length <= EXCERPT_MAX_LENGTH) score += 25;
  else if (article.excerpt && article.excerpt.trim().length > 0) score += 15;
  if (article.cover_image && article.cover_image.trim().length > 0) score += 25;
  if (article.body && article.body.length >= CONTENT_MIN_LENGTH) score += 25;

  return score;
}

function generateRecommendations(article: {
  id: string;
  title: string;
  keywords: string | null;
  excerpt: string | null;
  cover_image: string | null;
  body: string | null;
}): SEORecommendation {
  const recommendations: string[] = [];
  let score = 0;
  
  const hasKeywords = article.keywords && article.keywords.trim().length > 0;
  const hasExcerpt = article.excerpt && article.excerpt.trim().length > 0;
  const hasOptimalExcerpt = article.excerpt && article.excerpt.length >= EXCERPT_MIN_LENGTH && article.excerpt.length <= EXCERPT_MAX_LENGTH;
  const hasCoverImage = article.cover_image && article.cover_image.trim().length > 0;
  const hasOptimalContent = article.body && article.body.length >= CONTENT_MIN_LENGTH;

  if (hasKeywords) score += 25;
  if (hasOptimalExcerpt) score += 25;
  else if (hasExcerpt) score += 15;
  if (hasCoverImage) score += 25;
  if (hasOptimalContent) score += 25;

  if (!hasKeywords) {
    recommendations.push('Adicione palavras-chave relevantes para melhorar a indexação nos buscadores');
  }
  
  if (!hasExcerpt) {
    recommendations.push('Crie um resumo (excerpt) de 120-160 caracteres para aparecer nos resultados de busca');
  } else if (!hasOptimalExcerpt) {
    const length = article.excerpt?.length || 0;
    if (length < EXCERPT_MIN_LENGTH) {
      recommendations.push(`Aumente o resumo para pelo menos ${EXCERPT_MIN_LENGTH} caracteres (atual: ${length})`);
    } else {
      recommendations.push(`Reduza o resumo para no máximo ${EXCERPT_MAX_LENGTH} caracteres (atual: ${length})`);
    }
  }
  
  if (!hasCoverImage) {
    recommendations.push('Adicione uma imagem de capa atraente para aumentar o engajamento');
  }
  
  if (!hasOptimalContent) {
    const length = article.body?.length || 0;
    recommendations.push(`Expanda o conteúdo para pelo menos ${CONTENT_MIN_LENGTH} caracteres (atual: ${length})`);
  }

  let priority: 'high' | 'medium' | 'low' = 'low';
  if (score < 50) priority = 'high';
  else if (score < 75) priority = 'medium';

  return {
    articleId: article.id,
    articleTitle: article.title,
    priority,
    recommendations,
    score,
  };
}

function generateAlerts(article: {
  id: string;
  title: string;
  keywords: string | null;
  excerpt: string | null;
  cover_image: string | null;
  body: string | null;
  published_at: string | null;
}): SEOAlert[] {
  const alerts: SEOAlert[] = [];
  const now = new Date().toISOString();

  const hasKeywords = article.keywords && article.keywords.trim().length > 0;
  const hasExcerpt = article.excerpt && article.excerpt.trim().length > 0;
  const hasCoverImage = article.cover_image && article.cover_image.trim().length > 0;
  const hasOptimalContent = article.body && article.body.length >= CONTENT_MIN_LENGTH;

  if (!hasKeywords) {
    alerts.push({
      id: `${article.id}-keywords`,
      type: 'missing_keywords',
      articleId: article.id,
      articleTitle: article.title,
      message: 'Artigo publicado sem palavras-chave definidas',
      severity: 'error',
      createdAt: now,
    });
  }

  if (!hasExcerpt) {
    alerts.push({
      id: `${article.id}-excerpt`,
      type: 'missing_excerpt',
      articleId: article.id,
      articleTitle: article.title,
      message: 'Artigo publicado sem resumo (excerpt)',
      severity: 'error',
      createdAt: now,
    });
  }

  if (!hasCoverImage) {
    alerts.push({
      id: `${article.id}-image`,
      type: 'missing_image',
      articleId: article.id,
      articleTitle: article.title,
      message: 'Artigo publicado sem imagem de capa',
      severity: 'warning',
      createdAt: now,
    });
  }

  if (!hasOptimalContent) {
    alerts.push({
      id: `${article.id}-content`,
      type: 'short_content',
      articleId: article.id,
      articleTitle: article.title,
      message: 'Conteúdo abaixo do tamanho ideal (3000+ caracteres)',
      severity: 'info',
      createdAt: now,
    });
  }

  return alerts;
}

export function useSEOHistory(days: number = 30) {
  return useQuery({
    queryKey: ['seo-history', days],
    queryFn: async (): Promise<SEOHistoryPoint[]> => {
      // Fetch all articles with their creation/update dates
      const { data: articles, error } = await supabase
        .from('content_articles')
        .select('id, keywords, excerpt, cover_image, body, created_at, published_at, status')
        .eq('status', 'published')
        .order('published_at', { ascending: true });

      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      // Generate history points by simulating score evolution
      const history: SEOHistoryPoint[] = [];
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        const articlesUntilDate = articles.filter(a => {
          const pubDate = new Date(a.published_at || a.created_at);
          return pubDate <= currentDate;
        });

        if (articlesUntilDate.length === 0) continue;

        const totalScore = articlesUntilDate.reduce((sum, a) => sum + calculateArticleSEOScore(a), 0);
        const avgScore = Math.round(totalScore / articlesUntilDate.length);

        history.push({
          date: format(currentDate, 'dd/MM'),
          score: avgScore,
          articlesCount: articlesUntilDate.length,
        });
      }

      return history;
    },
  });
}

export function useSEORecommendations() {
  return useQuery({
    queryKey: ['seo-recommendations'],
    queryFn: async (): Promise<SEORecommendation[]> => {
      const { data: articles, error } = await supabase
        .from('content_articles')
        .select('id, title, keywords, excerpt, cover_image, body')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      const recommendations = articles
        .map(generateRecommendations)
        .filter(r => r.recommendations.length > 0)
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      return recommendations;
    },
  });
}

export function useSEOAlerts() {
  return useQuery({
    queryKey: ['seo-alerts'],
    queryFn: async (): Promise<SEOAlert[]> => {
      const { data: articles, error } = await supabase
        .from('content_articles')
        .select('id, title, keywords, excerpt, cover_image, body, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (!articles || articles.length === 0) return [];

      const allAlerts = articles.flatMap(generateAlerts);
      
      // Sort by severity (error first, then warning, then info)
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    },
  });
}

export function useSEOSummary() {
  return useQuery({
    queryKey: ['seo-summary'],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from('content_articles')
        .select('id, keywords, excerpt, cover_image, body')
        .eq('status', 'published');

      if (error) throw error;
      if (!articles || articles.length === 0) {
        return {
          totalArticles: 0,
          averageScore: 0,
          articlesWithFullSEO: 0,
          articlesNeedingWork: 0,
          criticalIssues: 0,
        };
      }

      let totalScore = 0;
      let articlesWithFullSEO = 0;
      let criticalIssues = 0;

      articles.forEach(article => {
        const score = calculateArticleSEOScore(article);
        totalScore += score;
        if (score === 100) articlesWithFullSEO++;
        if (score < 50) criticalIssues++;
      });

      return {
        totalArticles: articles.length,
        averageScore: Math.round(totalScore / articles.length),
        articlesWithFullSEO,
        articlesNeedingWork: articles.length - articlesWithFullSEO,
        criticalIssues,
      };
    },
  });
}
