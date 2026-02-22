import { useState, useMemo } from 'react';
import { FileText, Eye, TrendingUp, Calendar, Loader2, Search, Wand2, Youtube, Video, VideoOff, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useDashboardStats, useRecentArticles, useRecentActivity, useViewsChart, calculateChange } from '@/hooks/use-dashboard-stats';
import { useSEOStats } from '@/hooks/use-seo-stats';
import { useVideoStats } from '@/hooks/use-video-stats';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SEOOverview } from '@/components/dashboard/SEOOverview';
import { TopArticlesRanking } from '@/components/dashboard/TopArticlesRanking';
import { KeywordCloud } from '@/components/dashboard/KeywordCloud';
import { SEOArticleTable } from '@/components/dashboard/SEOArticleTable';
import { invokeEdgeFunction } from '@/lib/edge-functions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PeriodOption = '7' | '14' | '30' | '90' | 'this-month' | 'last-month';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('14');
  const [isExpandingExcerpts, setIsExpandingExcerpts] = useState(false);
  
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    let label: string;

    switch (selectedPeriod) {
      case '7':
        start = subDays(now, 6);
        label = 'Últimos 7 dias';
        break;
      case '14':
        start = subDays(now, 13);
        label = 'Últimos 14 dias';
        break;
      case '30':
        start = subDays(now, 29);
        label = 'Últimos 30 dias';
        break;
      case '90':
        start = subDays(now, 89);
        label = 'Últimos 90 dias';
        break;
      case 'this-month':
        start = startOfMonth(now);
        label = 'Este mês';
        break;
      case 'last-month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        label = 'Mês passado';
        break;
      default:
        start = subDays(now, 13);
        label = 'Últimos 14 dias';
    }

    return { startDate: start, endDate: end, label };
  }, [selectedPeriod]);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentArticles, isLoading: articlesLoading } = useRecentArticles(5);
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(5);
  const { data: viewsData, isLoading: chartLoading } = useViewsChart(dateRange.startDate, dateRange.endDate);
  const { data: seoStats, isLoading: seoLoading, refetch: refetchSEO } = useSEOStats();
  const { data: videoStats, isLoading: videoStatsLoading } = useVideoStats();

  const handleExpandExcerpts = async () => {
    setIsExpandingExcerpts(true);
    try {
      const { data, error } = await invokeEdgeFunction('expand-excerpts');
      
      if (error) throw error;
      
      if (data.updated > 0) {
        toast.success(`${data.updated} excerpts expandidos com sucesso!`, {
          description: 'Os resumos foram otimizados para SEO (120-160 caracteres).',
        });
        refetchSEO();
      } else {
        toast.info('Todos os excerpts já estão otimizados!', {
          description: 'Nenhum artigo precisou de ajuste.',
        });
      }
    } catch (error) {
      console.error('Error expanding excerpts:', error);
      toast.error('Erro ao expandir excerpts', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      });
    } finally {
      setIsExpandingExcerpts(false);
    }
  };

  // Count articles with short excerpts
  const shortExcerptsCount = seoStats?.articlesSEO?.filter(
    a => !a.criteria.hasOptimalExcerpt
  ).length ?? 0;
  

  const statsCards = [
    { 
      title: 'Artigos Publicados', 
      value: stats?.totalArticles ?? 0, 
      icon: FileText, 
      change: calculateChange(stats?.totalArticles ?? 0, stats?.articlesLastMonth ?? 0)
    },
    { 
      title: 'Visualizações', 
      value: stats?.totalViews ?? 0, 
      icon: Eye, 
      change: calculateChange(stats?.viewsThisMonth ?? 0, stats?.viewsLastMonth ?? 0)
    },
    { 
      title: 'Engajamento', 
      value: `${stats?.engagement ?? 0}`, 
      icon: TrendingUp, 
      change: 'views/artigo'
    },
    { 
      title: 'Este Mês', 
      value: stats?.articlesThisMonth ?? 0, 
      icon: Calendar, 
      change: 'artigos publicados'
    },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd MMM yyyy", { locale: ptBR });
  };

  const chartConfig = {
    views: {
      label: "Visualizações",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie seu conteúdo e acompanhe as métricas
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {stat.change}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Views Chart */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 p-3 sm:p-6">
            <div className="space-y-0.5 sm:space-y-1">
              <CardTitle className="text-base sm:text-lg">Visualizações</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {dateRange.label}
              </CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodOption)}>
              <SelectTrigger className="w-full sm:w-[160px] h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="14">Últimos 14 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="this-month">Este mês</SelectItem>
                <SelectItem value="last-month">Mês passado</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {chartLoading ? (
              <div className="flex items-center justify-center h-[180px] sm:h-[250px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : viewsData && viewsData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[180px] sm:h-[250px] w-full">
                <AreaChart data={viewsData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    allowDecimals={false}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#viewsGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px] sm:h-[250px] text-muted-foreground text-sm">
                Nenhuma visualização registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Statistics Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <h2 className="text-lg sm:text-xl font-semibold">Vídeos do YouTube</h2>
          </div>
          
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Total Videos */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total de Vídeos
                </CardTitle>
                <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {videoStatsLoading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">{videoStats?.totalVideos ?? 0}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {videoStats?.enabledVideos ?? 0} ativos
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Coverage */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Cobertura
                </CardTitle>
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {videoStatsLoading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">{videoStats?.coveragePercentage ?? 0}%</div>
                    <Progress 
                      value={videoStats?.coveragePercentage ?? 0} 
                      className="h-1.5 mt-2"
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Without Videos */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Sem Vídeo
                </CardTitle>
                <VideoOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {videoStatsLoading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold text-orange-500">
                      {videoStats?.articlesWithoutVideo ?? 0}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      artigos pendentes
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Added This Month */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Este Mês
                </CardTitle>
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {videoStatsLoading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg sm:text-2xl font-bold">{videoStats?.videosAddedThisMonth ?? 0}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      +{videoStats?.videosAddedToday ?? 0} hoje
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Coverage Bar */}
          <Card className={cn(
            "border-border/50 overflow-hidden",
            (videoStats?.coveragePercentage ?? 0) >= 80 && "border-primary/30"
          )}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    (videoStats?.coveragePercentage ?? 0) >= 80 
                      ? "bg-primary/10" 
                      : "bg-orange-500/10"
                  )}>
                    <Youtube className={cn(
                      "h-5 w-5",
                      (videoStats?.coveragePercentage ?? 0) >= 80 
                        ? "text-primary" 
                        : "text-orange-500"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cobertura de Vídeos</p>
                    <p className="text-xs text-muted-foreground">
                      {videoStats?.articlesWithVideo ?? 0} de {(videoStats?.articlesWithVideo ?? 0) + (videoStats?.articlesWithoutVideo ?? 0)} artigos com vídeo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 sm:w-32">
                    <Progress 
                      value={videoStats?.coveragePercentage ?? 0} 
                      className={cn(
                        "h-2",
                        (videoStats?.coveragePercentage ?? 0) >= 80 && "[&>div]:bg-primary"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-bold min-w-[3rem] text-right",
                    (videoStats?.coveragePercentage ?? 0) >= 80 
                      ? "text-primary" 
                      : "text-orange-500"
                  )}>
                    {videoStats?.coveragePercentage ?? 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Analysis Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold">Análise SEO</h2>
            </div>
            
            {shortExcerptsCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandExcerpts}
                disabled={isExpandingExcerpts}
                className="gap-1.5 sm:gap-2 h-8 text-xs sm:text-sm w-full sm:w-auto"
              >
                {isExpandingExcerpts ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
                {isExpandingExcerpts ? 'Otimizando...' : `Otimizar ${shortExcerptsCount} Excerpts`}
              </Button>
            )}
          </div>
          
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <SEOOverview 
              overallScore={seoStats?.overallScore ?? 0}
              criteriaPercentages={seoStats?.criteriaPercentages ?? { keywords: 0, excerpt: 0, coverImage: 0, content: 0 }}
              isLoading={seoLoading}
            />
            <KeywordCloud 
              keywords={seoStats?.topKeywords ?? []}
              isLoading={seoLoading}
            />
          </div>
          
          <SEOArticleTable 
            articles={seoStats?.articlesSEO ?? []}
            isLoading={seoLoading}
          />
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Artigos Recentes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Últimos artigos criados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {articlesLoading ? (
                <div className="flex items-center justify-center h-28 sm:h-32">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentArticles && recentArticles.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{article.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {article.category} • {formatDate(article.published_at)}
                        </p>
                      </div>
                      <Badge 
                        variant={article.status === 'published' ? 'default' : 'secondary'}
                        className="shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2.5"
                      >
                        {article.status === 'published' ? 'Pub.' : 'Rasc.'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 sm:h-32 text-muted-foreground text-sm">
                  Nenhum artigo criado ainda
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Atividade</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ações recentes no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {activityLoading ? (
                <div className="flex items-center justify-center h-28 sm:h-32">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                      <div className={`mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0 ${
                        activity.type === 'published' ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm">
                          <span className="font-medium">
                            {activity.type === 'published' ? 'Pub.' : 'Criado'}:
                          </span>{' '}
                          <span className="text-muted-foreground truncate">
                            {activity.title}
                          </span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 sm:h-32 text-muted-foreground text-sm">
                  Nenhuma atividade recente
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Articles Ranking */}
        <TopArticlesRanking />
      </div>
    </DashboardLayout>
  );
}
