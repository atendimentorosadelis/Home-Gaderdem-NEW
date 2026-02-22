import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OnlinePresenceContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  onlineCount: number;
}

const OnlinePresenceContext = createContext<OnlinePresenceContextType | undefined>(undefined);

export function OnlinePresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  useEffect(() => {
    if (!user) {
      setOnlineUsers(new Set());
      return;
    }

    console.log('[Presence] Setting up channel for user:', user.id);

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const userIds = new Set<string>();
        
        Object.entries(state).forEach(([key, presences]) => {
          // The key itself is the user_id (set in config.presence.key)
          if (key) {
            userIds.add(key);
          }
          // Also check the presence payload
          if (Array.isArray(presences)) {
            presences.forEach((presence: any) => {
              if (presence.user_id) {
                userIds.add(presence.user_id);
              }
            });
          }
        });
        
        console.log('[Presence] Sync - Online users:', Array.from(userIds));
        setOnlineUsers(userIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          // Add the key (user_id from config)
          if (key) {
            updated.add(key);
          }
          if (Array.isArray(newPresences)) {
            newPresences.forEach((presence: any) => {
              if (presence.user_id) {
                updated.add(presence.user_id);
              }
            });
          }
          console.log('[Presence] Join - Added:', key);
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          // Remove the key (user_id from config)
          if (key) {
            updated.delete(key);
          }
          if (Array.isArray(leftPresences)) {
            leftPresences.forEach((presence: any) => {
              if (presence.user_id) {
                updated.delete(presence.user_id);
              }
            });
          }
          console.log('[Presence] Leave - Removed:', key);
          return updated;
        });
      })
      .subscribe(async (status) => {
        console.log('[Presence] Channel status:', status);
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
          console.log('[Presence] Tracked user:', user.id);
        }
      });

    setChannel(presenceChannel);

    // Keep presence alive with periodic updates
    const interval = setInterval(async () => {
      if (presenceChannel) {
        await presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    }, 30000);

    return () => {
      console.log('[Presence] Cleaning up channel');
      clearInterval(interval);
      presenceChannel.unsubscribe();
    };
  }, [user]);

  return (
    <OnlinePresenceContext.Provider value={{ onlineUsers, isUserOnline, onlineCount: onlineUsers.size }}>
      {children}
    </OnlinePresenceContext.Provider>
  );
}

export function useOnlinePresence() {
  const context = useContext(OnlinePresenceContext);
  if (context === undefined) {
    throw new Error('useOnlinePresence must be used within an OnlinePresenceProvider');
  }
  return context;
}
