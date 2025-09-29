export type Screen = 'config' | 'exercise' | 'rest' | 'betweenSets' | 'complete';

export interface WorkoutConfig {
  exercises: string[];
  exerciseDuration: number;
  restDuration: number;
}

export interface WorkoutState {
  screen: Screen;
  currentExerciseIndex: number;
  currentSet: number;
  timeRemaining: number;
  isPaused: boolean;
  totalSets: number;
  workoutStartTime: Date | null;
  workoutEndTime: Date | null;
}

export interface TimerState {
  timeRemaining: number;
  isPaused: boolean;
  isActive: boolean;
}

export interface AudioCueType {
  frequency: number;
  duration: number;
}

export const TIME_OPTIONS = [15, 30, 45, 60, 90, 120, 180] as const;
export type TimeOption = typeof TIME_OPTIONS[number];

export const DEFAULT_EXERCISES = ['Push-ups', 'Squats', 'Plank', 'Jumping Jacks'];