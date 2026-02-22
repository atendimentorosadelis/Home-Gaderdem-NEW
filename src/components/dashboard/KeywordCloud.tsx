import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Loader2 } from 'lucide-react';

interface KeywordCloudProps {
  keywords: { keyword: string; count: number }[];
  isLoading?: boolean;
}

export function KeywordCloud({ keywords, isLoading }: KeywordCloudProps) {
  const maxCount = Math.max(...keywords.map(k => k.count), 1);

  const getSizeClass = (count: number) => {
    const ratio = count / maxCount;
    if (ratio >= 0.8) return 'text-lg px-3 py-1.5';
    if (ratio >= 0.5) return 'text-base px-2.5 py-1';
    return 'text-sm px-2 py-0.5';
  };

  const getVariant = (index: number): 'default' | 'secondary' | 'outline' => {
    if (index < 3) return 'default';
    if (index < 8) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Top Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24 sm:h-32 p-3 sm:p-6">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (keywords.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Top Keywords
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-24 sm:h-32 text-muted-foreground text-sm p-3 sm:p-6">
          Nenhuma keyword encontrada
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Top Keywords
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {keywords.map((item, index) => (
            <Badge
              key={item.keyword}
              variant={getVariant(index)}
              className={`${getSizeClass(item.count)} transition-all hover:scale-105 cursor-default text-[10px] sm:text-xs`}
            >
              {item.keyword}
              <span className="ml-1 sm:ml-1.5 opacity-60">({item.count})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
