import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkoutPersistence } from '../hooks/useWorkoutPersistence';
import type { Screen, WorkoutConfig, WorkoutSession } from '../types/workout';
import { DEFAULT_EXERCISES } from '../types/workout';
import { WorkoutContext } from './WorkoutContext';
import type { WorkoutContextType } from './WorkoutTypes';

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({
  children,
}) => {
  const [screen, setScreen] = useState<Screen>('config');
  const [config, setConfig] = useState<WorkoutConfig>({
    exercises: [...DEFAULT_EXERCISES, ''],
    exerciseDuration: 30,
    restDuration: 30,
  });
  const [session, setSession] = useState<WorkoutSession | null>(null);

  // Persistence
  useWorkoutPersistence({
    exercises: config.exercises,
    exerciseDuration: config.exerciseDuration,
    restDuration: config.restDuration,
    setExercises: (exercises) => setConfig((prev) => ({ ...prev, exercises })),
    setExerciseDuration: (duration) =>
      setConfig((prev) => ({ ...prev, exerciseDuration: duration })),
    setRestDuration: (duration) =>
      setConfig((prev) => ({ ...prev, restDuration: duration })),
  });

  // Derived values
  const validExercises = useMemo(
    () => config.exercises.filter((e) => e.trim()),
    [config.exercises]
  );

  const currentExercise = useMemo(() => {
    if (!session || validExercises.length === 0) return null;
    const exercise =
      validExercises[session.currentExerciseIndex % validExercises.length];
    return exercise;
  }, [session, validExercises]);

  const nextExercise = useMemo(() => {
    if (!session || validExercises.length === 0) return null;
    return validExercises[
      (session.currentExerciseIndex + 1) % validExercises.length
    ];
  }, [session, validExercises]);

  // Log current state (outside of render)
  useEffect(() => {
    if (session) {
      console.log('📋 CURRENT STATE:', {
        exercise: currentExercise,
        exerciseIndex: session.currentExerciseIndex,
        set: session.currentSet,
        screen,
        segmentIndex: session.currentSegmentIndex,
      });
    }
  }, [session, currentExercise, screen]);

  const setProgress = useMemo(() => {
    if (
      !session ||
      screen === 'config' ||
      screen === 'betweenSets' ||
      screen === 'complete'
    ) {
      return 0;
    }
    return session.currentSegmentIndex / session.totalSegments;
  }, [session, screen]);

  // Config actions
  const updateConfig = useCallback((updates: Partial<WorkoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateExercise = useCallback((index: number, value: string) => {
    setConfig((prev) => {
      const newExercises = [...prev.exercises];
      newExercises[index] = value;

      // Add empty field if last one is filled
      if (index === prev.exercises.length - 1 && value.trim()) {
        newExercises.push('');
      }

      return { ...prev, exercises: newExercises };
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setConfig((prev) => {
      const newExercises = prev.exercises.filter((_, i) => i !== index);
      // Ensure there's always an empty field at the end
      if (
        newExercises.length === 0 ||
        newExercises[newExercises.length - 1].trim()
      ) {
        newExercises.push('');
      }
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const reorderExercises = useCallback(
    (dragIndex: number, dropIndex: number) => {
      setConfig((prev) => {
        const newExercises = [...prev.exercises];
        const draggedExercise = newExercises[dragIndex];
        newExercises.splice(dragIndex, 1);
        newExercises.splice(dropIndex, 0, draggedExercise);
        return { ...prev, exercises: newExercises };
      });
    },
    []
  );

  // Workout flow actions
  const startWorkout = useCallback(() => {
    if (validExercises.length === 0) return;

    const totalSegments = validExercises.length * 2 - 1; // N exercises + (N-1) rests

    console.log('🚀 STARTING WORKOUT:', {
      exercises: validExercises,
      totalSegments,
      exerciseDuration: config.exerciseDuration,
      restDuration: config.restDuration,
    });

    setSession({
      config,
      currentExerciseIndex: 0,
      currentSet: 1,
      currentSegmentIndex: 0,
      totalSegments,
      totalSets: 0,
      startTime: new Date(),
      endTime: null,
    });

    setScreen('exercise');
  }, [validExercises, config]);

  const completeExercise = useCallback(() => {
    if (!session) return;

    const isLastExercise =
      session.currentExerciseIndex === validExercises.length - 1;
    const currentExercise = validExercises[session.currentExerciseIndex];

    console.log('✅ EXERCISE COMPLETE:', {
      exercise: currentExercise,
      exerciseIndex: session.currentExerciseIndex,
      isLastExercise,
      currentSet: session.currentSet,
      segmentIndex: session.currentSegmentIndex,
    });

    if (isLastExercise) {
      // Last exercise of set - go to between sets
      console.log('🏁 SET COMPLETE - Going to between sets');
      setScreen('betweenSets');
    } else {
      // Go to rest and increment segment index
      console.log(
        '😴 Going to rest, next up:',
        validExercises[session.currentExerciseIndex + 1]
      );
      setSession({
        ...session,
        currentSegmentIndex: session.currentSegmentIndex + 1,
      });
      setScreen('rest');
    }
  }, [session, validExercises]);

  const completeRest = useCallback(() => {
    if (!session) return;

    const nextExerciseIndex = session.currentExerciseIndex + 1;
    const nextExercise = validExercises[nextExerciseIndex];

    console.log('🔄 REST COMPLETE:', {
      nextExerciseIndex,
      nextExercise,
      currentSet: session.currentSet,
      segmentIndex: session.currentSegmentIndex + 1,
    });

    // Go to next exercise and increment segment index
    setSession({
      ...session,
      currentExerciseIndex: session.currentExerciseIndex + 1,
      currentSegmentIndex: session.currentSegmentIndex + 1,
    });
    setScreen('exercise');
  }, [session, validExercises]);

  const completeSet = useCallback(() => {
    if (!session) return;

    const nextSet = session.currentSet + 1;

    console.log('🎯 BETWEEN SETS COMPLETE - Starting Set', nextSet, {
      resetExerciseIndex: 0,
      resetSegmentIndex: 0,
      firstExercise: validExercises[0],
    });

    // Start next set automatically
    setSession({
      ...session,
      currentSet: session.currentSet + 1,
      currentExerciseIndex: 0,
      currentSegmentIndex: 0,
    });
    setScreen('exercise');
  }, [session, validExercises]);

  const endWorkout = useCallback(() => {
    if (!session) return;

    setSession({
      ...session,
      totalSets: session.currentSet,
      endTime: new Date(),
    });
    setScreen('complete');
  }, [session]);

  const resetWorkout = useCallback(() => {
    setSession(null);
    setScreen('config');
  }, []);

  const value: WorkoutContextType = useMemo(
    () => ({
      config,
      session,
      screen,
      updateConfig,
      updateExercise,
      removeExercise,
      reorderExercises,
      startWorkout,
      endWorkout,
      completeExercise,
      completeRest,
      completeSet,
      resetWorkout,
      validExercises,
      currentExercise,
      nextExercise,
      setProgress,
    }),
    [
      config,
      session,
      screen,
      updateConfig,
      updateExercise,
      removeExercise,
      reorderExercises,
      startWorkout,
      endWorkout,
      completeExercise,
      completeRest,
      completeSet,
      resetWorkout,
      validExercises,
      currentExercise,
      nextExercise,
      setProgress,
    ]
  );

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
};
