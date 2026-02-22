import { useState } from 'react';
import { Settings2, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { COMMEMORATIVE_DATES, getEventDate } from '@/data/commemorative-dates';
import { useCommemorativeDateSettings } from '@/hooks/use-commemorative-date-settings';
import { cn } from '@/lib/utils';

export function CommemorativeDateSettingsDialog() {
  const [open, setOpen] = useState(false);
  const { 
    settings, 
    isLoading, 
    isSaving, 
    toggleSetting, 
    enableAll, 
    disableAll,
    isEnabled 
  } = useCommemorativeDateSettings();

  const enabledCount = settings.filter(s => s.is_enabled).length;
  const totalCount = COMMEMORATIVE_DATES.length;

  // Group dates by category
  const groupedDates = {
    geral: COMMEMORATIVE_DATES.filter(d => d.category === 'geral'),
    jardim: COMMEMORATIVE_DATES.filter(d => d.category === 'jardim'),
    decoracao: COMMEMORATIVE_DATES.filter(d => d.category === 'decoracao'),
  };

  const categoryLabels = {
    geral: 'Datas Gerais',
    jardim: 'Jardim & Flores',
    decoracao: 'Decoração',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Configurar Alertas</span>
          <span className="sm:hidden">Alertas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="hidden sm:inline">Configurar Alertas de Datas Comemorativas</span>
            <span className="sm:hidden">Alertas de Datas</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Escolha quais datas comemorativas devem exibir alertas no dashboard.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                {enabledCount} de {totalCount} ativas
              </Badge>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disableAll}
                  disabled={isSaving || enabledCount === 0}
                  className="flex-1 sm:flex-none text-xs"
                >
                  Desativar Todas
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={enableAll}
                  disabled={isSaving || enabledCount === totalCount}
                  className="flex-1 sm:flex-none text-xs"
                >
                  Ativar Todas
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[350px] sm:h-[400px] pr-2 sm:pr-4">
              <div className="space-y-4 sm:space-y-6">
                {(Object.keys(groupedDates) as Array<keyof typeof groupedDates>).map((category) => (
                  <div key={category}>
                    <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
                      {categoryLabels[category]}
                    </h4>
                    <div className="space-y-2">
                      {groupedDates[category].map((date) => {
                        const IconComp = date.icon;
                        const eventDate = getEventDate(date);
                        const formattedDate = format(eventDate, "d 'de' MMMM", { locale: ptBR });
                        const enabled = isEnabled(date.id);

                        return (
                          <div
                            key={date.id}
                            className={cn(
                              "flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors",
                              enabled 
                                ? "bg-background border-border" 
                                : "bg-muted/30 border-border/50"
                            )}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className={cn(
                                "p-1.5 sm:p-2 rounded-full shrink-0",
                                enabled ? "bg-primary/10" : "bg-muted"
                              )}>
                                <IconComp className={cn(
                                  "h-3.5 w-3.5 sm:h-4 sm:w-4",
                                  enabled ? "text-primary" : "text-muted-foreground"
                                )} />
                              </div>
                              <div className="min-w-0">
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  !enabled && "text-muted-foreground"
                                )}>
                                  {date.label}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  {formattedDate}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={() => toggleSetting(date.id)}
                              disabled={isSaving}
                              className="shrink-0 ml-2"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="my-3 sm:my-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="text-xs text-muted-foreground text-center pt-2">
              Os alertas aparecem até 3 dias antes da data comemorativa
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
