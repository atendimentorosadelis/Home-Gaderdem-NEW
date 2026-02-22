import { useState } from 'react';
import { useImageQueue, QueueItem } from '@/hooks/use-image-queue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Loader2, 
  Image as ImageIcon,
  Play,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImageQueueStatusProps {
  articleId: string;
  onImageReady?: (imageUrl: string, imageType: 'cover' | 'gallery', imageIndex: number) => void;
}

const statusConfig: Record<string, {
  label: string;
  icon: typeof Clock;
  color: string;
  animate?: boolean;
}> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'bg-muted text-muted-foreground',
  },
  processing: {
    label: 'Processando',
    icon: Loader2,
    color: 'bg-primary/20 text-primary',
    animate: true,
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    color: 'bg-accent text-accent-foreground',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    color: 'bg-destructive/20 text-destructive',
  },
  retrying: {
    label: 'Aguardando retry',
    icon: RefreshCw,
    color: 'bg-secondary text-secondary-foreground',
  },
};

export function ImageQueueStatus({ articleId, onImageReady }: ImageQueueStatusProps) {
  const { 
    queueItems, 
    isLoading, 
    isProcessing,
    retryItem, 
    cancelItem, 
    triggerQueueProcessing,
    getQueueStats 
  } = useImageQueue(articleId);
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const stats = getQueueStats();
  const hasActiveItems = stats.pending > 0 || stats.processing > 0 || stats.retrying > 0;
  const progress = stats.total > 0 ? ((stats.completed + stats.failed) / stats.total) * 100 : 0;

  // Notify parent when images are ready
  const completedItems = queueItems.filter(i => i.status === 'completed' && i.result_url);
  
  if (queueItems.length === 0) {
    return null;
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatNextRetry = (nextRetryAt: string | null) => {
    if (!nextRetryAt) return '';
    const date = new Date(nextRetryAt);
    if (date <= new Date()) return 'em breve';
    return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Fila de Geração de Imagens
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveItems && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerQueueProcessing()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Processar
              </Button>
            )}
            <div className="flex gap-1">
              {stats.completed > 0 && (
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {stats.completed} ✓
                </Badge>
              )}
              {stats.failed > 0 && (
                <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                  {stats.failed} ✗
                </Badge>
              )}
              {(stats.pending + stats.processing + stats.retrying) > 0 && (
                <Badge variant="secondary">
                  {stats.pending + stats.processing + stats.retrying} pendente(s)
                </Badge>
              )}
            </div>
          </div>
        </div>
        {stats.total > 0 && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </CardHeader>
      
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          queueItems.map((item) => (
            <QueueItemRow
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpanded(item.id)}
              onRetry={() => retryItem(item.id)}
              onCancel={() => cancelItem(item.id)}
              formatNextRetry={formatNextRetry}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface QueueItemRowProps {
  item: QueueItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRetry: () => void;
  onCancel: () => void;
  formatNextRetry: (date: string | null) => string;
}

function QueueItemRow({ 
  item, 
  isExpanded, 
  onToggleExpand, 
  onRetry, 
  onCancel,
  formatNextRetry 
}: QueueItemRowProps) {
  const config = statusConfig[item.status] || statusConfig.pending;
  const Icon = config.icon;
  const canRetry = item.status === 'failed';
  const canCancel = item.status === 'pending' || item.status === 'retrying';

  return (
    <div 
      className="border rounded-lg p-3 space-y-2 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={onToggleExpand}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.animate ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {item.image_type === 'cover' ? 'Capa' : `Galeria ${item.image_index + 1}`}
          </span>
          <Badge variant="secondary" className={config.color}>
            {config.label}
          </Badge>
          {item.retry_count > 0 && (
            <span className="text-xs text-muted-foreground">
              ({item.retry_count}/{item.max_retries} tentativas)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {item.status === 'retrying' && item.next_retry_at && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Próxima tentativa {formatNextRetry(item.next_retry_at)}</span>
        </div>
      )}

      {item.status === 'failed' && item.error_message && (
        <div className="flex items-start gap-1 text-xs text-destructive bg-destructive/10 p-2 rounded">
          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{item.error_message}</span>
        </div>
      )}

      {item.status === 'completed' && item.result_url && (
        <div className="flex items-center gap-2">
          <img 
            src={item.result_url} 
            alt={`${item.image_type} gerada`}
            className="h-12 w-12 object-cover rounded"
          />
          <CheckCircle2 className="h-4 w-4 text-accent-foreground" />
        </div>
      )}

      {isExpanded && (
        <div className="pt-2 border-t mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            <strong>Prompt:</strong> {item.prompt}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Criado:</strong> {formatDistanceToNow(new Date(item.created_at), { locale: ptBR, addSuffix: true })}
          </p>
          {item.completed_at && (
            <p className="text-xs text-muted-foreground">
              <strong>Concluído:</strong> {formatDistanceToNow(new Date(item.completed_at), { locale: ptBR, addSuffix: true })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
