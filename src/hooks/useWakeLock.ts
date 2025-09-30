import { useCallback, useRef } from 'react';

export const useWakeLock = () => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const wakeLockControllerRef = useRef<AbortController | null>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      // Check for the newer WakeLock API first
      const windowWithWakeLock = window as typeof window & { 
        WakeLock?: { request: (type: string, options: { signal: AbortSignal }) => Promise<void> } 
      };
      
      if ('WakeLock' in window && windowWithWakeLock.WakeLock?.request) {
        const controller = new AbortController();
        const signal = controller.signal;

        await windowWithWakeLock.WakeLock.request('screen', { signal });
        wakeLockControllerRef.current = controller;

        console.log('Wake Lock is active (WakeLock API)');
        return;
      }

      // Fall back to navigator.wakeLock
      if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');

        wakeLockRef.current.addEventListener('release', (e) => {
          console.log('Wake Lock was released:', e);
          wakeLockRef.current = null;
        });

        console.log('Wake Lock is active (navigator.wakeLock)');
        return;
      }

      console.warn('Wake Lock API not supported');
    } catch (error) {
      console.warn('Wake lock failed:', error);
      wakeLockRef.current = null;
      wakeLockControllerRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockControllerRef.current) {
        wakeLockControllerRef.current.abort();
        wakeLockControllerRef.current = null;
        console.log('Wake Lock released (WakeLock API)');
      } else if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released (navigator.wakeLock)');
      }
    } catch (error) {
      console.warn('Wake lock release failed:', error);
    }
  }, []);

  return {
    requestWakeLock,
    releaseWakeLock,
  };
};