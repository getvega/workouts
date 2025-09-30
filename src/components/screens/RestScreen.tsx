import { Pause, Play } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { ProgressBar } from '../ui/ProgressBar';
import { useWorkout } from '../../hooks/useWorkoutContext';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import { useVibration } from '../../hooks/useVibration';
import { useOnMountUnsafe } from '../../hooks/useOnMountUnsafe';

export const RestScreen: React.FC = () => {
  const { config, session, nextExercise, setProgress, completeRest, endWorkout } = useWorkout();
  const timer = useTimer();
  const { playCountdownBeep } = useAudio();
  const { vibrate } = useVibration();
  
  // Use refs to avoid re-running effects when functions change
  const completeRestRef = useRef(completeRest);
  completeRestRef.current = completeRest;

  // Start timer and set callbacks when component mounts
  useOnMountUnsafe(() => {
    // Set timer callbacks
    timer.setOnTick((timeLeft: number) => {
      // Countdown audio cues (5, 4, 3, 2, 1, 0)
      if (timeLeft <= 5 && timeLeft >= 0) {
        playCountdownBeep(timeLeft);
        vibrate([100]);
      }
    });

    timer.setOnComplete(() => {
      // Use setTimeout to break the synchronous update chain and prevent 
      // "Cannot update component while rendering" errors
      setTimeout(() => {
        completeRestRef.current();
      }, 0);
    });

    // Start the timer
    timer.startTimer(config.restDuration);
  });

  const handlePauseResume = useCallback(() => {
    if (timer.isPaused) {
      timer.resumeTimer();
    } else {
      timer.pauseTimer();
    }
  }, [timer]);

  const getCircleProgress = () => {
    return ((config.restDuration - timer.timeRemaining) / config.restDuration) * 100;
  };
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress Bar */}
      <ProgressBar progress={setProgress} className="bg-gray-800" />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Current Set */}
        <h2 className="text-2xl font-semibold mb-4">Set {session?.currentSet}</h2>

        {/* Timer */}
        <div className="mb-8">
          <CircularTimer
            time={timer.timeRemaining}
            progress={getCircleProgress()}
            size={200}
            isExercise={false}
          />
        </div>

        {/* Next Exercise */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-400 mb-2">Up next:</p>
          <h1 className="text-3xl md:text-5xl font-bold">
            {nextExercise || 'Set Complete!'}
          </h1>
        </div>

        {/* Pause/Resume Button */}
        <button
          onClick={handlePauseResume}
          className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-gray-200"
        >
          {timer.isPaused ? <Play size={20} /> : <Pause size={20} />}
          {timer.isPaused ? 'Resume' : 'Pause'}
        </button>

        {/* End Workout */}
        <button onClick={endWorkout} className="mt-4 text-white text-lg">
          End Workout
        </button>
      </div>
    </div>
  );
};
