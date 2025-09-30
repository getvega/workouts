import React from 'react';
import { Button } from '../ui/Button';
import { formatDuration } from '../../utils/timeFormatters';
import { useWorkout } from '../../hooks/useWorkoutContext';

interface CompleteScreenProps {
  workoutDuration: number;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  workoutDuration,
}) => {
  const { session, resetWorkout } = useWorkout();
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
        Great Job!
      </h1>

      <div className="text-center space-y-4">
        <p className="text-2xl">
          You completed{' '}
          <span className="font-bold text-orange-500">{session?.totalSets}</span> set
          {session?.totalSets !== 1 ? 's' : ''}
        </p>
        <p className="text-xl text-gray-400">
          Total time: {formatDuration(workoutDuration)}
        </p>
      </div>

      <Button onClick={resetWorkout} className="mt-12" size="lg">
        New Workout
      </Button>
    </div>
  );
};