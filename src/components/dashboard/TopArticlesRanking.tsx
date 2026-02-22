import { Eye, Heart, Loader2, ExternalLink, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTopViewedArticles, useTopLikedArticles, TopArticle } from '@/hooks/use-top-articles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ArticleRowProps {
  article: TopArticle;
  rank: number;
  showViews?: boolean;
  showLikes?: boolean;
}

function ArticleRow({ article, rank, showViews = true, showLikes = true }: ArticleRowProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd MMM", { locale: ptBR });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
    if (rank === 2) return 'bg-slate-400/20 text-slate-500 border-slate-400/30';
    if (rank === 3) return 'bg-orange-600/20 text-orange-600 border-orange-600/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-md group">
      {/* Rank */}
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
        getRankBadge(rank)
      )}>
        {rank}
      </div>

      {/* Article Info */}
      <div className="flex-1 min-w-0">
        <Link 
          to={`/dashboard/articles/edit/${article.id}`}
          className="text-sm font-medium hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5 group-hover:underline"
        >
          {article.title}
          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {article.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {article.category}
            </Badge>
          )}
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {showViews && (
          <div className="flex items-center gap-1 text-sm">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium tabular-nums">{article.views_count.toLocaleString('pt-BR')}</span>
          </div>
        )}
        {showLikes && (
          <div className="flex items-center gap-1 text-sm">
            <Heart className="h-3.5 w-3.5 text-destructive" />
            <span className="font-medium tabular-nums">{article.likes_count.toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleList({ articles, isLoading, showViews = true, showLikes = true }: { 
  articles: TopArticle[] | undefined; 
  isLoading: boolean;
  showViews?: boolean;
  showLikes?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhum artigo encontrado
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {articles.map((article, index) => (
        <ArticleRow 
          key={article.id} 
          article={article} 
          rank={index + 1}
          showViews={showViews}
          showLikes={showLikes}
        />
      ))}
    </div>
  );
}

export function TopArticlesRanking() {
  const { data: topViewed, isLoading: loadingViewed } = useTopViewedArticles(10);
  const { data: topLiked, isLoading: loadingLiked } = useTopLikedArticles(10);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 p-3 sm:p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Ranking de Artigos</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Artigos mais populares por visualizações e curtidas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="views" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Eye className="h-3.5 w-3.5" />
              Mais Visualizados
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Heart className="h-3.5 w-3.5" />
              Mais Curtidos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="views" className="mt-0">
            <ArticleList 
              articles={topViewed} 
              isLoading={loadingViewed}
              showViews={true}
              showLikes={true}
            />
          </TabsContent>
          
          <TabsContent value="likes" className="mt-0">
            <ArticleList 
              articles={topLiked} 
              isLoading={loadingLiked}
              showViews={true}
              showLikes={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
