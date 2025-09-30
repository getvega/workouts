import { Pause, Play } from 'lucide-react';
import React from 'react';
import { CircularTimer } from '../ui/CircularTimer';
import { ProgressBar } from '../ui/ProgressBar';

interface RestScreenProps {
  currentSet: number;
  timeRemaining: number;
  isPaused: boolean;
  nextExercise: string | null;
  setProgress: number;
  circleProgress: number;
  onPauseResume: () => void;
  onEndWorkout: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({
  currentSet,
  timeRemaining,
  isPaused,
  nextExercise,
  setProgress,
  circleProgress,
  onPauseResume,
  onEndWorkout,
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress Bar */}
      <ProgressBar progress={setProgress} className="bg-gray-800" />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Current Set */}
        <h2 className="text-2xl font-semibold mb-4">Set {currentSet}</h2>

        {/* Timer */}
        <div className="mb-8">
          <CircularTimer
            time={timeRemaining}
            progress={circleProgress}
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
          onClick={onPauseResume}
          className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-gray-200"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
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
