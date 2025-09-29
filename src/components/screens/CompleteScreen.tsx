import React from 'react';
import { Button } from '../ui/Button';
import { formatDuration } from '../../utils/timeFormatters';

interface CompleteScreenProps {
  totalSets: number;
  workoutDuration: number;
  onNewWorkout: () => void;
}

export const CompleteScreen: React.FC<CompleteScreenProps> = ({
  totalSets,
  workoutDuration,
  onNewWorkout,
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
        Great Job!
      </h1>

      <div className="text-center space-y-4">
        <p className="text-2xl">
          You completed{' '}
          <span className="font-bold text-orange-500">{totalSets}</span> set
          {totalSets !== 1 ? 's' : ''}
        </p>
        <p className="text-xl text-gray-400">
          Total time: {formatDuration(workoutDuration)}
        </p>
      </div>

      <Button onClick={onNewWorkout} className="mt-12" size="lg">
        New Workout
      </Button>
    </div>
  );
};