import { Pause, Play } from 'lucide-react';
import React, { useCallback, useRef } from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { ProgressBar } from '../ui/ProgressBar';
import { useWorkout } from '../../hooks/useWorkoutContext';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import { useVibration } from '../../hooks/useVibration';
import { useOnMountUnsafe } from '../../hooks/useOnMountUnsafe';

export const ExerciseScreen: React.FC = () => {
  const { config, currentExercise, setProgress, completeExercise, endWorkout } = useWorkout();
  const timer = useTimer();
  const { playCountdownBeep, playHalfwayBeep } = useAudio();
  const { vibrate } = useVibration();
  
  // Use refs to avoid re-running effects when functions change
  const completeExerciseRef = useRef(completeExercise);
  completeExerciseRef.current = completeExercise;

  // Start timer and set callbacks when component mounts
  useOnMountUnsafe(() => {
    // Set timer callbacks
    timer.setOnTick((timeLeft: number) => {
      // Countdown audio cues (5, 4, 3, 2, 1, 0)
      if (timeLeft <= 5 && timeLeft >= 0) {
        playCountdownBeep(timeLeft);
        vibrate([100]);
      }

      // Halfway point beep
      if (timeLeft === Math.floor(config.exerciseDuration / 2)) {
        playHalfwayBeep();
        vibrate([50, 50, 50]);
      }
    });

    timer.setOnComplete(() => {
      // Use setTimeout to break the synchronous update chain and prevent 
      // "Cannot update component while rendering" errors
      setTimeout(() => {
        completeExerciseRef.current();
      }, 0);
    });

    // Start the timer
    timer.startTimer(config.exerciseDuration);
  });

  const handlePauseResume = useCallback(() => {
    if (timer.isPaused) {
      timer.resumeTimer();
    } else {
      timer.pauseTimer();
    }
  }, [timer]);

  const getCircleProgress = () => {
    return ((config.exerciseDuration - timer.timeRemaining) / config.exerciseDuration) * 100;
  };
  return (
    <div className="min-h-screen bg-orange-500 text-white flex flex-col animate-fade-in">
      {/* Progress Bar */}
      <ProgressBar progress={setProgress} />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Current Exercise */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 animate-scale-in">
          {currentExercise}
        </h1>

        {/* Timer */}
        <div className="mb-8 animate-scale-in">
          <CircularTimer
            time={timer.timeRemaining}
            progress={getCircleProgress()}
            size={250}
          />
        </div>

        {/* Pause/Resume Button */}
        <button
          onClick={handlePauseResume}
          className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2"
        >
          {timer.isPaused ? <Play size={24} /> : <Pause size={24} />}
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
