import React from 'react';
import { ExerciseList } from '../ui/ExerciseList';
import { Button } from '../ui/Button';
import { TIME_OPTIONS } from '../../types/workout';
import { generateShareURL } from '../../utils/urlSharing';
import { useWorkout } from '../../hooks/useWorkoutContext';

export const ConfigurationScreen: React.FC = () => {
  const { 
    config, 
    validExercises, 
    updateExercise, 
    removeExercise, 
    reorderExercises, 
    updateConfig, 
    startWorkout 
  } = useWorkout();

  const handleCopyShareLink = async () => {
    try {
      const url = generateShareURL(config.exercises, config.exerciseDuration, config.restDuration);
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.warn('Failed to copy share link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 animate-fade-in">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Workout Timer</h1>

        {/* Exercise List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Exercises</h2>
          <ExerciseList
            exercises={config.exercises}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            onReorderExercises={reorderExercises}
          />
        </div>

        {/* Time Configuration */}
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-lg font-semibold mb-2">
              Exercise Duration
            </label>
            <select
              value={config.exerciseDuration}
              onChange={(e) => updateConfig({ exerciseDuration: Number(e.target.value) })}
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
              value={config.restDuration}
              onChange={(e) => updateConfig({ restDuration: Number(e.target.value) })}
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
          onClick={startWorkout}
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