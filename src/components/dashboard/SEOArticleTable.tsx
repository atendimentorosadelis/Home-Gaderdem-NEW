import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  Image, 
  AlignLeft, 
  Check, 
  X, 
  ArrowUpDown,
  Eye,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ArticleSEO {
  id: string;
  title: string;
  slug: string | null;
  score: number;
  criteria: {
    hasKeywords: boolean;
    hasExcerpt: boolean;
    hasOptimalExcerpt: boolean;
    hasCoverImage: boolean;
    hasOptimalContent: boolean;
  };
  views: number;
  published_at: string | null;
}

interface SEOArticleTableProps {
  articles: ArticleSEO[];
  isLoading?: boolean;
}

type SortField = 'score' | 'views' | 'title' | 'published_at';
type SortDirection = 'asc' | 'desc';

export function SEOArticleTable({ articles, isLoading }: SEOArticleTableProps) {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'score':
        comparison = a.score - b.score;
        break;
      case 'views':
        comparison = a.views - b.views;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'published_at':
        comparison = new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-primary';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', variant: 'default' as const };
    if (score >= 60) return { label: 'Bom', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Regular', variant: 'outline' as const };
    return { label: 'Baixo', variant: 'destructive' as const };
  };

  const CriteriaIcon = ({ passed }: { passed: boolean }) => (
    passed ? (
      <Check className="h-4 w-4 text-primary" />
    ) : (
      <X className="h-4 w-4 text-destructive/70" />
    )
  );

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 -ml-3 hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
    </Button>
  );

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Performance SEO por Artigo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-36 sm:h-48 p-3 sm:p-6">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Performance SEO por Artigo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-36 sm:h-48 text-muted-foreground text-sm p-3 sm:p-6">
          Nenhum artigo publicado encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Performance SEO por Artigo
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Clique nos cabeçalhos para ordenar
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {/* Desktop Table */}
        <div className="hidden sm:block rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">
                  <SortButton field="title">Artigo</SortButton>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortButton field="score">Score</SortButton>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title="Keywords">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex items-center gap-1" title="Excerpt">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex items-center gap-1" title="Imagem">
                      <Image className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex items-center gap-1" title="Conteúdo">
                      <AlignLeft className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">
                  <SortButton field="views">Views</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedArticles.slice(0, 10).map((article) => {
                const scoreBadge = getScoreBadge(article.score);
                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[280px]" title={article.title}>
                          {article.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {article.published_at 
                            ? format(new Date(article.published_at), "dd MMM yyyy", { locale: ptBR })
                            : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getScoreColor(article.score)}`}
                              style={{ width: `${article.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10">{article.score}%</span>
                        </div>
                        <Badge variant={scoreBadge.variant} className="w-fit text-xs">
                          {scoreBadge.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-3">
                        <CriteriaIcon passed={article.criteria.hasKeywords} />
                        <CriteriaIcon passed={article.criteria.hasOptimalExcerpt} />
                        <CriteriaIcon passed={article.criteria.hasCoverImage} />
                        <CriteriaIcon passed={article.criteria.hasOptimalContent} />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{article.views}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2">
          {sortedArticles.slice(0, 6).map((article) => {
            const scoreBadge = getScoreBadge(article.score);
            return (
              <div key={article.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" title={article.title}>
                      {article.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {article.published_at 
                        ? format(new Date(article.published_at), "dd MMM yyyy", { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                  <Badge variant={scoreBadge.variant} className="text-[10px] px-1.5 shrink-0">
                    {article.score}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CriteriaIcon passed={article.criteria.hasKeywords} />
                    <CriteriaIcon passed={article.criteria.hasOptimalExcerpt} />
                    <CriteriaIcon passed={article.criteria.hasCoverImage} />
                    <CriteriaIcon passed={article.criteria.hasOptimalContent} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{article.views}</span>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreColor(article.score)}`}
                    style={{ width: `${article.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {articles.length > 10 && (
          <p className="hidden sm:block text-xs text-muted-foreground text-center mt-3">
            Mostrando 10 de {articles.length} artigos
          </p>
        )}
        {articles.length > 6 && (
          <p className="sm:hidden text-[10px] text-muted-foreground text-center mt-2">
            Mostrando 6 de {articles.length} artigos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
