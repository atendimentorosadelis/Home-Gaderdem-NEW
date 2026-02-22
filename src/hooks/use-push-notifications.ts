import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// VAPID public key - you'll need to generate this
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Check if already subscribed
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager?.getSubscription();
        setIsSubscribed(!!subscription);
      }
      
      setIsLoading(false);
    };

    checkSupport();
  }, []);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== 'granted') {
        toast.error('Permissão para notificações negada');
        return false;
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Save subscription to database
      const subscriptionJson = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
        }, {
          onConflict: 'endpoint',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notificações push ativadas!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar notificações push');
      return false;
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }

      setIsSubscribed(false);
      toast.success('Notificações push desativadas');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Erro ao desativar notificações push');
      return false;
    }
  }, [user, isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
}
