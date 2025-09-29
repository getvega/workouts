import { useCallback, useRef, useState } from 'react';
import type { TimerState } from '../types/workout';

export const useTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    isPaused: false,
    isActive: false,
  });

  const timerRef = useRef<number | null>(null);
  const onTickRef = useRef<((timeLeft: number) => void) | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const startTimer = useCallback((duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimerState({
      timeRemaining: duration,
      isPaused: false,
      isActive: true,
    });

    timerRef.current = setInterval(() => {
      setTimerState((prev) => {
        const newTime = prev.timeRemaining - 1;

        if (onTickRef.current) {
          onTickRef.current(newTime);
        }

        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }

          return {
            timeRemaining: 0,
            isPaused: false,
            isActive: false,
          };
        }

        return {
          ...prev,
          timeRemaining: newTime,
        };
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerState.timeRemaining > 0) {
      setTimerState((prev) => ({ ...prev, isPaused: false }));

      timerRef.current = setInterval(() => {
        setTimerState((prev) => {
          const newTime = prev.timeRemaining - 1;

          if (onTickRef.current) {
            onTickRef.current(newTime);
          }

          if (newTime <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }

            return {
              timeRemaining: 0,
              isPaused: false,
              isActive: false,
            };
          }

          return {
            ...prev,
            timeRemaining: newTime,
          };
        });
      }, 1000);
    }
  }, [timerState.timeRemaining]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState({
      timeRemaining: 0,
      isPaused: false,
      isActive: false,
    });
  }, []);

  const setOnTick = useCallback((callback: (timeLeft: number) => void) => {
    onTickRef.current = callback;
  }, []);

  const setOnComplete = useCallback((callback: () => void) => {
    onCompleteRef.current = callback;
  }, []);

  return {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setOnTick,
    setOnComplete,
  };
};