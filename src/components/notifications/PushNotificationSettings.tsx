import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

export function PushNotificationSettings() {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notificações Push</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seu navegador não suporta notificações push.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BellRing className={cn('h-5 w-5', isSubscribed ? 'text-primary' : 'text-muted-foreground')} />
          <CardTitle className="text-lg">Notificações Push</CardTitle>
        </div>
        <CardDescription>
          Receba notificações mesmo quando não estiver no site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="push-toggle" className="font-medium">
              Ativar notificações push
            </Label>
            <p className="text-sm text-muted-foreground">
              {permission === 'denied' 
                ? 'Notificações bloqueadas. Habilite nas configurações do navegador.'
                : isSubscribed 
                  ? 'Você receberá notificações de novos artigos e atualizações.'
                  : 'Ative para receber alertas importantes.'}
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              id="push-toggle"
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={permission === 'denied'}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
