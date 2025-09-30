import type { Screen, WorkoutConfig, WorkoutSession } from '../types/workout';

export interface WorkoutContextType {
  // State
  config: WorkoutConfig;
  session: WorkoutSession | null;
  screen: Screen;
  
  // Config actions
  updateConfig: (updates: Partial<WorkoutConfig>) => void;
  updateExercise: (index: number, value: string) => void;
  removeExercise: (index: number) => void;
  reorderExercises: (dragIndex: number, dropIndex: number) => void;
  
  // Workout flow actions
  startWorkout: () => void;
  endWorkout: () => void;
  completeExercise: () => void;
  completeRest: () => void;
  completeSet: () => void;
  resetWorkout: () => void;
  
  // Derived values
  validExercises: string[];
  currentExercise: string | null;
  nextExercise: string | null;
  setProgress: number;
}