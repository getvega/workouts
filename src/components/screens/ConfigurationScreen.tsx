import React from 'react';
import { ExerciseList } from '../ui/ExerciseList';
import { Button } from '../ui/Button';
import { TIME_OPTIONS } from '../../types/workout';
import { generateShareURL } from '../../utils/urlSharing';

interface ConfigurationScreenProps {
  exercises: string[];
  exerciseDuration: number;
  restDuration: number;
  onUpdateExercise: (index: number, value: string) => void;
  onRemoveExercise: (index: number) => void;
  onReorderExercises: (dragIndex: number, dropIndex: number) => void;
  onSetExerciseDuration: (duration: number) => void;
  onSetRestDuration: (duration: number) => void;
  onStartWorkout: () => void;
}

export const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({
  exercises,
  exerciseDuration,
  restDuration,
  onUpdateExercise,
  onRemoveExercise,
  onReorderExercises,
  onSetExerciseDuration,
  onSetRestDuration,
  onStartWorkout,
}) => {
  const validExercises = exercises.filter((e) => e.trim());

  const handleCopyShareLink = async () => {
    try {
      const url = generateShareURL(exercises, exerciseDuration, restDuration);
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.warn('Failed to copy share link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Workout Timer</h1>

        {/* Exercise List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Exercises</h2>
          <ExerciseList
            exercises={exercises}
            onUpdateExercise={onUpdateExercise}
            onRemoveExercise={onRemoveExercise}
            onReorderExercises={onReorderExercises}
          />
        </div>

        {/* Time Configuration */}
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-2">
              Exercise Duration
            </label>
            <select
              value={exerciseDuration}
              onChange={(e) => onSetExerciseDuration(Number(e.target.value))}
              className="w-full bg-gray-800 text-white p-3 rounded-lg text-lg"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}s
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">
              Rest Duration
            </label>
            <select
              value={restDuration}
              onChange={(e) => onSetRestDuration(Number(e.target.value))}
              className="w-full bg-gray-800 text-white p-3 rounded-lg text-lg"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}s
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={onStartWorkout}
          disabled={validExercises.length === 0}
          className="w-full"
          size="lg"
        >
          Start Workout
        </Button>

        {/* Share Button */}
        {validExercises.length > 0 && (
          <Button
            onClick={handleCopyShareLink}
            variant="secondary"
            className="w-full mt-4"
          >
            Copy Share Link
          </Button>
        )}
      </div>
    </div>
  );
};