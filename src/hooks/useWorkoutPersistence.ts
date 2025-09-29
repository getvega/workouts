import { useEffect } from 'react';
import type { WorkoutConfig } from '../types/workout';
import { parseURLParams } from '../utils/urlSharing';

interface UseWorkoutPersistenceProps {
  exercises: string[];
  exerciseDuration: number;
  restDuration: number;
  setExercises: (exercises: string[]) => void;
  setExerciseDuration: (duration: number) => void;
  setRestDuration: (duration: number) => void;
}

export const useWorkoutPersistence = ({
  exercises,
  exerciseDuration,
  restDuration,
  setExercises,
  setExerciseDuration,
  setRestDuration,
}: UseWorkoutPersistenceProps) => {
  // Load from localStorage and URL on mount
  useEffect(() => {
    // First try to load from URL
    const urlParams = parseURLParams();

    if (urlParams.exercises) {
      setExercises(urlParams.exercises);
    } else {
      // Fall back to localStorage
      const savedConfig = localStorage.getItem('workoutConfig');
      if (savedConfig) {
        try {
          const config: WorkoutConfig = JSON.parse(savedConfig);
          setExercises(config.exercises || exercises);
        } catch (error) {
          console.warn('Failed to parse saved workout config:', error);
        }
      }
    }

    if (urlParams.exerciseTime) {
      setExerciseDuration(urlParams.exerciseTime);
    } else {
      const savedConfig = localStorage.getItem('workoutConfig');
      if (savedConfig) {
        try {
          const config: WorkoutConfig = JSON.parse(savedConfig);
          setExerciseDuration(config.exerciseDuration || 30);
        } catch (error) {
          console.warn('Failed to parse saved workout config:', error);
        }
      }
    }

    if (urlParams.restTime) {
      setRestDuration(urlParams.restTime);
    } else {
      const savedConfig = localStorage.getItem('workoutConfig');
      if (savedConfig) {
        try {
          const config: WorkoutConfig = JSON.parse(savedConfig);
          setRestDuration(config.restDuration || 30);
        } catch (error) {
          console.warn('Failed to parse saved workout config:', error);
        }
      }
    }
  }, []);

  // Save to localStorage whenever config changes
  useEffect(() => {
    const config: WorkoutConfig = {
      exercises,
      exerciseDuration,
      restDuration,
    };
    localStorage.setItem('workoutConfig', JSON.stringify(config));
  }, [exercises, exerciseDuration, restDuration]);
};
