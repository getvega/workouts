import { Pause, Play } from 'lucide-react';
import React from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { ProgressBar } from '../ui/ProgressBar';

interface ExerciseScreenProps {
  currentExercise: string;
  timeRemaining: number;
  isPaused: boolean;
  setProgress: number;
  circleProgress: number;
  onPauseResume: () => void;
  onEndWorkout: () => void;
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  currentExercise,
  timeRemaining,
  isPaused,
  setProgress,
  circleProgress,
  onPauseResume,
  onEndWorkout,
}) => {
  return (
    <div className="min-h-screen bg-orange-500 text-white flex flex-col">
      {/* Progress Bar */}
      <ProgressBar progress={setProgress} />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Current Exercise */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          {currentExercise}
        </h1>

        {/* Timer */}
        <div className="mb-8">
          <CircularTimer
            time={timeRemaining}
            progress={circleProgress}
            size={250}
            isExercise={true}
          />
        </div>

        {/* Pause/Resume Button */}
        <button
          onClick={onPauseResume}
          className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2"
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        {/* End Workout */}
        <button onClick={onEndWorkout} className="mt-4 text-white text-lg">
          End Workout
        </button>
      </div>
    </div>
  );
};
