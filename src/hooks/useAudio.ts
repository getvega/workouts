import { useCallback, useRef } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(
    (frequency = 800, duration = 200) => {
      try {
        const audioContext = createAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    },
    [createAudioContext]
  );

  const playCountdownBeep = useCallback(
    (number: number) => {
      const frequency = number === 0 ? 1200 : number === 1 ? 1000 : 600;
      playBeep(frequency, 300);
    },
    [playBeep]
  );

  const playHalfwayBeep = useCallback(() => {
    playBeep(800, 150);
    setTimeout(() => playBeep(800, 150), 200);
  }, [playBeep]);

  const playSetCompleteSound = useCallback(() => {
    playBeep(600, 200);
    setTimeout(() => playBeep(800, 200), 150);
    setTimeout(() => playBeep(1000, 300), 300);
  }, [playBeep]);

  return {
    playCountdownBeep,
    playHalfwayBeep,
    playSetCompleteSound,
  };
};