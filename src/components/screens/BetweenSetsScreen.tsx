import React, { useRef } from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { Button } from '../ui/Button';
import { useWorkout } from '../../hooks/useWorkoutContext';
import { useTimer } from '../../hooks/useTimer';
import { useAudio } from '../../hooks/useAudio';
import { useVibration } from '../../hooks/useVibration';
import { useOnMountUnsafe } from '../../hooks/useOnMountUnsafe';

export const BetweenSetsScreen: React.FC = () => {
  const { session, completeSet, endWorkout } = useWorkout();
  const timer = useTimer();
  const { playSetCompleteSound } = useAudio();
  const { vibrate } = useVibration();
  
  // Use refs to avoid re-running effects when functions change
  const completeSetRef = useRef(completeSet);
  completeSetRef.current = completeSet;

  // Start timer and set callbacks when component mounts
  useOnMountUnsafe(() => {
    // Play set complete sound and vibration
    playSetCompleteSound();
    vibrate([200, 100, 200]);
    
    // Set timer callback
    timer.setOnComplete(() => {
      // Use setTimeout to break the synchronous update chain and prevent 
      // "Cannot update component while rendering" errors
      setTimeout(() => {
        completeSetRef.current();
      }, 0);
    });
    
    // Start the timer
    timer.startTimer(30); // 30-second break
  });

  const getCircleProgress = () => {
    return ((30 - timer.timeRemaining) / 30) * 100;
  };
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {/* Congratulations */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
        Set {session?.currentSet} Complete!
      </h1>
      <p className="text-xl text-gray-400 mb-8 text-center">Great job!</p>

      {/* Timer */}
      <div className="mb-8">
        <CircularTimer
          time={timer.timeRemaining}
          progress={getCircleProgress()}
          size={180}
          isExercise={false}
        />
      </div>

      <p className="text-lg text-gray-400 mb-8 text-center">
        Next set starts automatically in {timer.timeRemaining}s
      </p>

      {/* End Workout Button */}
      <Button onClick={endWorkout} variant="danger" size="lg">
        End Workout
      </Button>
    </div>
  );
};