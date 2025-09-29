import { useCallback } from 'react';

export const useVibration = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { vibrate };
};