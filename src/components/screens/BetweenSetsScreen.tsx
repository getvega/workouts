import React from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { Button } from '../ui/Button';

interface BetweenSetsScreenProps {
  currentSet: number;
  timeRemaining: number;
  circleProgress: number;
  onEndWorkout: () => void;
}

export const BetweenSetsScreen: React.FC<BetweenSetsScreenProps> = ({
  currentSet,
  timeRemaining,
  circleProgress,
  onEndWorkout,
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {/* Congratulations */}
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
        Set {currentSet} Complete!
      </h1>
      <p className="text-xl text-gray-400 mb-8 text-center">Great job!</p>

      {/* Timer */}
      <div className="mb-8">
        <CircularTimer
          time={timeRemaining}
          progress={circleProgress}
          size={180}
          isExercise={false}
        />
      </div>

      <p className="text-lg text-gray-400 mb-8 text-center">
        Next set starts automatically in {timeRemaining}s
      </p>

      {/* End Workout Button */}
      <Button onClick={onEndWorkout} variant="danger" size="lg">
        End Workout
      </Button>
    </div>
  );
};