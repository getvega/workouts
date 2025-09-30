import type { EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

/**
 * A hook that runs an effect only once on mount, even in React StrictMode.
 *
 * This hook uses a ref to track whether the effect has already been executed,
 * preventing double execution that can occur in StrictMode during development.
 *
 * Use this hook when you need to ensure an effect runs exactly once on mount,
 * such as setting up timers, initializing external libraries, or making API calls
 * that should not be duplicated.
 *
 * @param effect - The effect function to run once on mount
 */
export function useOnMountUnsafe(effect: EffectCallback) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
