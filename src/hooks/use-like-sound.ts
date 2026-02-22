import { useCallback, useRef } from 'react';

export const useLikeSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playLikeSound = useCallback(() => {
    try {
      // Create audio context on demand (browser requirement)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Create a gentle "pop" sound for likes
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start at higher frequency and slide down for a "pop" effect
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1); // A4
      
      // Quick attack, gentle decay
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('Could not play like sound:', error);
    }
  }, []);

  return { playLikeSound };
};
