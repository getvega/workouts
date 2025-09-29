import React, { useCallback, useEffect, useState } from 'react';
import { BetweenSetsScreen } from './components/screens/BetweenSetsScreen';
import { CompleteScreen } from './components/screens/CompleteScreen';
import { ConfigurationScreen } from './components/screens/ConfigurationScreen';
import { ExerciseScreen } from './components/screens/ExerciseScreen';
import { RestScreen } from './components/screens/RestScreen';
import { useAudio } from './hooks/useAudio';
import { useTimer } from './hooks/useTimer';
import { useVibration } from './hooks/useVibration';
import { useWakeLock } from './hooks/useWakeLock';
import { useWorkoutPersistence } from './hooks/useWorkoutPersistence';
import type { Screen } from './types/workout';
import { DEFAULT_EXERCISES } from './types/workout';

const App: React.FC = () => {
  // State management
  const [screen, setScreen] = useState<Screen>('config');
  const [exercises, setExercises] = useState<string[]>([
    ...DEFAULT_EXERCISES,
    '',
  ]);
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(30);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutEndTime, setWorkoutEndTime] = useState<Date | null>(null);

  // Custom hooks
  const timer = useTimer();
  const { playCountdownBeep, playHalfwayBeep, playSetCompleteSound } =
    useAudio();
  const { vibrate } = useVibration();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Persistence
  useWorkoutPersistence({
    exercises,
    exerciseDuration,
    restDuration,
    setExercises,
    setExerciseDuration,
    setRestDuration,
  });

  // Derived state
  const validExercises = exercises.filter((e) => e.trim());
  const currentExercise =
    validExercises[currentExerciseIndex % validExercises.length];
  const nextExercise =
    validExercises[(currentExerciseIndex + 1) % validExercises.length];

  const getSetProgress = () => {
    // Return 0 for config, betweenSets, and complete screens
    if (
      screen === 'config' ||
      screen === 'betweenSets' ||
      screen === 'complete'
    )
      return 0;

    // Total time for one complete set (all exercises + rests)
    // Note: Last exercise has no rest after it, so (validExercises.length - 1) rest periods
    const totalSetTime =
      validExercises.length * exerciseDuration +
      (validExercises.length - 1) * restDuration;

    // Time elapsed in current set
    let elapsedTime = 0;

    // Add time for completed exercises (each exercise + its rest, except the last one)
    for (let i = 0; i < currentExerciseIndex; i++) {
      elapsedTime += exerciseDuration;
      if (i < validExercises.length - 1) {
        // No rest after last exercise
        elapsedTime += restDuration;
      }
    }

    // Add time for current activity
    if (screen === 'exercise') {
      elapsedTime += exerciseDuration - timer.timeRemaining;
    } else if (screen === 'rest') {
      elapsedTime += exerciseDuration; // Current exercise was completed
      elapsedTime += restDuration - timer.timeRemaining; // Current rest progress
    }

    return Math.min(elapsedTime / totalSetTime, 1); // Cap at 1.0 (100%)
  };

  const getCircleProgress = () => {
    const duration =
      screen === 'exercise'
        ? exerciseDuration
        : screen === 'rest'
          ? restDuration
          : 30;
    return ((duration - timer.timeRemaining) / duration) * 100;
  };

  // Timer callbacks
  useEffect(() => {
    timer.setOnTick((timeLeft: number) => {
      // Countdown audio cues (5, 4, 3, 2, 1, 0)
      if (timeLeft <= 5 && timeLeft >= 0) {
        playCountdownBeep(timeLeft);
        vibrate([100]);
      }

      // Halfway point beep (only for exercises)
      if (
        screen === 'exercise' &&
        timeLeft === Math.floor(exerciseDuration / 2)
      ) {
        playHalfwayBeep();
        vibrate([50, 50, 50]);
      }
    });

    timer.setOnComplete(() => {
      console.log('🚀 ~ timer.setOnComplete:', currentExerciseIndex, screen);
      if (screen === 'exercise') {
        if (currentExerciseIndex === validExercises.length - 1) {
          // Last exercise of set - go to between sets
          playSetCompleteSound();
          vibrate([200, 100, 200]);
          setScreen('betweenSets');
          timer.startTimer(30); // 30-second break
        } else {
          // Go to rest
          setScreen('rest');
          timer.startTimer(restDuration);
        }
      } else if (screen === 'rest') {
        // Go to next exercise
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setScreen('exercise');
        timer.startTimer(exerciseDuration);
      } else if (screen === 'betweenSets') {
        // Start next set automatically
        setCurrentSet(currentSet + 1);
        setCurrentExerciseIndex(0);
        setScreen('exercise');
        timer.startTimer(exerciseDuration);
      }
    });
  }, [
    screen,
    currentExerciseIndex,
    currentSet,
    validExercises.length,
    exerciseDuration,
    restDuration,
    timer,
    playCountdownBeep,
    playHalfwayBeep,
    playSetCompleteSound,
    vibrate,
  ]);

  // Exercise management
  const updateExercise = useCallback((index: number, value: string) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      newExercises[index] = value;

      // Add empty field if last one is filled
      if (index === prev.length - 1 && value.trim()) {
        newExercises.push('');
      }

      return newExercises;
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setExercises((prev) => {
      const newExercises = prev.filter((_, i) => i !== index);
      // Ensure there's always an empty field at the end
      if (
        newExercises.length === 0 ||
        newExercises[newExercises.length - 1].trim()
      ) {
        newExercises.push('');
      }
      return newExercises;
    });
  }, []);

  const reorderExercises = useCallback(
    (dragIndex: number, dropIndex: number) => {
      setExercises((prev) => {
        const newExercises = [...prev];
        const draggedExercise = newExercises[dragIndex];

        newExercises.splice(dragIndex, 1);
        newExercises.splice(dropIndex, 0, draggedExercise);

        return newExercises;
      });
    },
    []
  );

  // Workout control
  const startWorkout = useCallback(async () => {
    if (validExercises.length === 0) return;

    await requestWakeLock();
    setWorkoutStartTime(new Date());
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setScreen('exercise');
    timer.startTimer(exerciseDuration);
  }, [validExercises.length, requestWakeLock, exerciseDuration, timer]);

  const endWorkout = useCallback(() => {
    timer.stopTimer();
    setWorkoutEndTime(new Date());
    setTotalSets(currentSet);
    setScreen('complete');
    releaseWakeLock();
  }, [timer, currentSet, releaseWakeLock]);

  const resetWorkout = useCallback(() => {
    timer.stopTimer();
    setScreen('config');
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setWorkoutStartTime(null);
    setWorkoutEndTime(null);
    setTotalSets(0);
    releaseWakeLock();
  }, [timer, releaseWakeLock]);

  const handlePauseResume = useCallback(() => {
    if (timer.isPaused) {
      timer.resumeTimer();
    } else {
      timer.pauseTimer();
    }
  }, [timer]);

  // Handle visibility changes for wake lock
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        (screen === 'exercise' || screen === 'rest' || screen === 'betweenSets')
      ) {
        requestWakeLock();
      }
    };

    if (
      screen === 'exercise' ||
      screen === 'rest' ||
      screen === 'betweenSets'
    ) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);

      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        document.removeEventListener(
          'fullscreenchange',
          handleVisibilityChange
        );
      };
    }
  }, [screen, requestWakeLock]);

  // Screen rendering
  switch (screen) {
    case 'config':
      return (
        <ConfigurationScreen
          exercises={exercises}
          exerciseDuration={exerciseDuration}
          restDuration={restDuration}
          onUpdateExercise={updateExercise}
          onRemoveExercise={removeExercise}
          onReorderExercises={reorderExercises}
          onSetExerciseDuration={setExerciseDuration}
          onSetRestDuration={setRestDuration}
          onStartWorkout={startWorkout}
        />
      );

    case 'exercise':
      return (
        <ExerciseScreen
          currentExercise={currentExercise}
          timeRemaining={timer.timeRemaining}
          isPaused={timer.isPaused}
          setProgress={getSetProgress()}
          circleProgress={getCircleProgress()}
          onPauseResume={handlePauseResume}
          onEndWorkout={endWorkout}
        />
      );

    case 'rest':
      return (
        <RestScreen
          currentSet={currentSet}
          timeRemaining={timer.timeRemaining}
          isPaused={timer.isPaused}
          nextExercise={nextExercise}
          setProgress={getSetProgress()}
          circleProgress={getCircleProgress()}
          onPauseResume={handlePauseResume}
          onEndWorkout={endWorkout}
        />
      );

    case 'betweenSets':
      return (
        <BetweenSetsScreen
          currentSet={currentSet}
          timeRemaining={timer.timeRemaining}
          circleProgress={getCircleProgress()}
          onEndWorkout={endWorkout}
        />
      );

    case 'complete': {
      const workoutDuration =
        workoutEndTime && workoutStartTime
          ? workoutEndTime.getTime() - workoutStartTime.getTime()
          : 0;

      return (
        <CompleteScreen
          totalSets={totalSets}
          workoutDuration={workoutDuration}
          onNewWorkout={resetWorkout}
        />
      );
    }

    default:
      return null;
  }
};

export default App;
