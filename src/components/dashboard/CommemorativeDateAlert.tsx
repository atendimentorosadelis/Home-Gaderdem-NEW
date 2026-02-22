import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ActiveCommemorativeDate } from '@/hooks/use-commemorative-dates';

interface CommemorativeDateAlertProps {
  dates: ActiveCommemorativeDate[];
  onGenerateArticle: (date: ActiveCommemorativeDate) => void;
}

function getAlertStyles(daysUntil: number) {
  if (daysUntil === 0) {
    return {
      borderClass: 'border-red-500 animate-pulse-border-intense',
      badgeClass: 'bg-red-500 text-white animate-bounce',
      badgeText: '🎉 É HOJE!',
      glowClass: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
    };
  }
  if (daysUntil === 1) {
    return {
      borderClass: 'border-orange-500 animate-pulse-border',
      badgeClass: 'bg-orange-500 text-white',
      badgeText: '⏰ Amanhã!',
      glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
    };
  }
  return {
    borderClass: 'border-yellow-500 animate-pulse-border-soft',
    badgeClass: 'bg-yellow-500 text-black',
    badgeText: `📅 Faltam ${daysUntil} dias`,
    glowClass: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
  };
}

function getIconColor(color: string) {
  const colorMap: Record<string, string> = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    cyan: 'text-cyan-500',
    amber: 'text-amber-500'
  };
  return colorMap[color] || 'text-primary';
}

function getButtonColor(color: string) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500 hover:bg-red-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600',
    amber: 'bg-amber-500 hover:bg-amber-600 text-black'
  };
  return colorMap[color] || 'bg-primary hover:bg-primary/90';
}

export function CommemorativeDateAlert({ dates, onGenerateArticle }: CommemorativeDateAlertProps) {
  if (dates.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Datas Comemorativas Próximas</span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dates.map((date) => {
          const styles = getAlertStyles(date.daysUntil);
          const IconComponent = date.icon;
          
          return (
            <Card 
              key={date.id}
              className={cn(
                'relative border-2 transition-all duration-300',
                styles.borderClass,
                styles.glowClass
              )}
            >
              {/* Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className={cn('text-xs', styles.badgeClass)}>
                  {styles.badgeText}
                </Badge>
              </div>
              
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'p-3 rounded-full bg-muted',
                    date.isToday && 'animate-pulse'
                  )}>
                    <IconComponent className={cn(
                      'h-8 w-8',
                      getIconColor(date.color)
                    )} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{date.label}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(date.eventDate, "d 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {date.topicSuggestion}
                    </p>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  className={cn(
                    'w-full mt-4 gap-2',
                    getButtonColor(date.color),
                    date.isToday && 'animate-pulse'
                  )}
                  onClick={() => onGenerateArticle(date)}
                >
                  <Sparkles className="h-4 w-4" />
                  Gerar Artigo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
