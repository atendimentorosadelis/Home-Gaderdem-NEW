import { History, RefreshCw, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GenerationHistoryItem } from '@/hooks/use-generation-history';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface GenerationHistoryProps {
  history: GenerationHistoryItem[];
  isLoading: boolean;
  onRegenerate: (topic: string) => void;
  onDelete: (id: string) => void;
  isGenerating: boolean;
}

export function GenerationHistory({
  history,
  isLoading,
  onRegenerate,
  onDelete,
  isGenerating
}: GenerationHistoryProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Gerações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Gerações
          </CardTitle>
          <CardDescription>
            Seus artigos gerados aparecerão aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum artigo gerado ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Gerações
        </CardTitle>
        <CardDescription>
          Regenere artigos anteriores ou veja os resultados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  item.status === 'success' 
                    ? "bg-accent/50 border-border" 
                    : "bg-destructive/10 border-destructive/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.status === 'success' ? (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">
                        {item.article_title || item.topic}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate pl-6">
                      Tema: {item.topic}
                    </p>
                    <p className="text-xs text-muted-foreground pl-6">
                      {formatDistanceToNow(new Date(item.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.article_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                        title="Ver artigo"
                      >
                        <Link to={`/admin/articles/edit/${item.article_id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRegenerate(item.topic)}
                      disabled={isGenerating}
                      className="h-8 w-8"
                      title="Regenerar com mesmo tema"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                      disabled={isGenerating}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Remover do histórico"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
