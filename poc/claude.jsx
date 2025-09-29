import { GripVertical, Pause, Play, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const WorkoutApp = () => {
  // State management
  const [screen, setScreen] = useState('config'); // config, exercise, rest, betweenSets, complete
  const [exercises, setExercises] = useState(['Push-ups', 'Squats', 'Plank', 'Jumping Jacks', '']);
  const [exerciseDuration, setExerciseDuration] = useState(30);
  const [restDuration, setRestDuration] = useState(30);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalSets, setTotalSets] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutEndTime, setWorkoutEndTime] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Refs
  const timerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const wakeLockControllerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Time options
  const timeOptions = [15, 30, 45, 60, 90, 120, 180];

  // Audio system
  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 200) => {
    try {
      const audioContext = createAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [createAudioContext]);

  const playCountdownBeep = useCallback((number) => {
    const frequency = number === 0 ? 1200 : number === 1 ? 1000 : 600;
    playBeep(frequency, 300);
  }, [playBeep]);

  const playHalfwayBeep = useCallback(() => {
    playBeep(800, 150);
    setTimeout(() => playBeep(800, 150), 200);
  }, [playBeep]);

  const playSetCompleteSound = useCallback(() => {
    playBeep(600, 200);
    setTimeout(() => playBeep(800, 200), 150);
    setTimeout(() => playBeep(1000, 300), 300);
  }, [playBeep]);

  // Vibration
  const vibrate = useCallback((pattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Wake lock management
  const requestWakeLock = useCallback(async () => {
    try {
      // Check for the newer WakeLock API first
      if ('WakeLock' in window && 'request' in window.WakeLock) {
        const controller = new AbortController();
        const signal = controller.signal;

        await window.WakeLock.request('screen', { signal });
        wakeLockControllerRef.current = controller;

        console.log('Wake Lock is active (WakeLock API)');
        return;
      }

      // Fall back to navigator.wakeLock
      if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');

        wakeLockRef.current.addEventListener('release', (e) => {
          console.log('Wake Lock was released:', e);
          wakeLockRef.current = null;
        });

        console.log('Wake Lock is active (navigator.wakeLock)');
        return;
      }

      console.warn('Wake Lock API not supported');
    } catch (error) {
      console.warn('Wake lock failed:', error);
      wakeLockRef.current = null;
      wakeLockControllerRef.current = null;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockControllerRef.current) {
        wakeLockControllerRef.current.abort();
        wakeLockControllerRef.current = null;
        console.log('Wake Lock released (WakeLock API)');
      } else if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released (navigator.wakeLock)');
      }
    } catch (error) {
      console.warn('Wake lock release failed:', error);
    }
  }, []);

  // Handle visibility and fullscreen changes to reacquire wake lock
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' &&
        (wakeLockRef.current !== null || wakeLockControllerRef.current !== null) &&
        (screen === 'exercise' || screen === 'rest' || screen === 'betweenSets')) {
      requestWakeLock();
    }
  }, [requestWakeLock, screen]);

  useEffect(() => {
    // Add event listeners for visibility and fullscreen changes during workout
    if (screen === 'exercise' || screen === 'rest' || screen === 'betweenSets') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleVisibilityChange);
      };
    }
  }, [screen, handleVisibilityChange]);

  // Local storage
  useEffect(() => {
    const savedConfig = localStorage.getItem('workoutConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setExercises(config.exercises || exercises);
      setExerciseDuration(config.exerciseDuration || 30);
      setRestDuration(config.restDuration || 30);
    }
  }, []);

  useEffect(() => {
    const config = {
      exercises,
      exerciseDuration,
      restDuration
    };
    localStorage.setItem('workoutConfig', JSON.stringify(config));
  }, [exercises, exerciseDuration, restDuration]);

  // URL sharing
  const generateShareURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set('exercises', exercises.filter(e => e.trim()).join(','));
    params.set('exerciseTime', exerciseDuration);
    params.set('restTime', restDuration);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [exercises, exerciseDuration, restDuration]);

  // Load from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlExercises = urlParams.get('exercises');
    const urlExerciseTime = urlParams.get('exerciseTime');
    const urlRestTime = urlParams.get('restTime');

    if (urlExercises) {
      setExercises([...urlExercises.split(','), '']);
    }
    if (urlExerciseTime) {
      setExerciseDuration(parseInt(urlExerciseTime));
    }
    if (urlRestTime) {
      setRestDuration(parseInt(urlRestTime));
    }
  }, []);

  // Timer logic
  const startTimer = useCallback((duration) => {
    setTimeRemaining(duration);
    setIsPaused(false);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        // Countdown audio cues (5, 4, 3, 2, 1, 0)
        if (newTime <= 5 && newTime >= 0) {
          playCountdownBeep(newTime);
          vibrate([100]);
        }

        // Halfway point beep (only for exercises)
        if (newTime === Math.floor(exerciseDuration / 2)) {
          playHalfwayBeep();
          vibrate([50, 50, 50]);
        }

        return newTime;
      });
    }, 1000);
  }, [screen, exerciseDuration, playCountdownBeep, playHalfwayBeep, vibrate]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    stopTimer();
  }, [stopTimer]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        if (newTime <= 5 && newTime >= 0) {
          playCountdownBeep(newTime);
          vibrate([100]);
        }

        if (newTime === Math.floor(exerciseDuration / 2)) {
          playHalfwayBeep();
          vibrate([50, 50, 50]);
        }

        return newTime;
      });
    }, 1000);
  }, [screen, exerciseDuration, playCountdownBeep, playHalfwayBeep, vibrate]);

  // Timer completion handler
  useEffect(() => {
    if (timeRemaining === 0 && timerRef.current) {
      stopTimer();

      if (screen === 'exercise') {
        const validExercises = exercises.filter(e => e.trim());
        if (currentExerciseIndex === validExercises.length - 1) {
          // Last exercise of set - go to between sets
          playSetCompleteSound();
          vibrate([200, 100, 200]);
          setScreen('betweenSets');
          startTimer(30); // 30-second break
        } else {
          // Go to rest
          setScreen('rest');
          startTimer(restDuration);
        }
      } else if (screen === 'rest') {
        // Go to next exercise
        setCurrentExerciseIndex(prev => prev + 1);
        setScreen('exercise');
        startTimer(exerciseDuration);
      } else if (screen === 'betweenSets') {
        // Start next set automatically
        setCurrentSet(prev => prev + 1);
        setCurrentExerciseIndex(0);
        setScreen('exercise');
        startTimer(exerciseDuration);
      }
    }
  }, [timeRemaining, screen, currentExerciseIndex, exercises, restDuration, exerciseDuration, startTimer, stopTimer, playSetCompleteSound, vibrate]);

  // Exercise management
  const updateExercise = (index, value) => {
    const newExercises = [...exercises];
    newExercises[index] = value;

    // Add empty field if last one is filled
    if (index === exercises.length - 1 && value.trim()) {
      newExercises.push('');
    }

    setExercises(newExercises);
  };

  const removeExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    // Ensure there's always an empty field at the end
    if (newExercises.length === 0 || newExercises[newExercises.length - 1].trim()) {
      newExercises.push('');
    }
    setExercises(newExercises);
  };

  // Drag and drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newExercises = [...exercises];
    const draggedExercise = newExercises[draggedIndex];

    newExercises.splice(draggedIndex, 1);
    newExercises.splice(dropIndex, 0, draggedExercise);

    setExercises(newExercises);
    setDraggedIndex(null);
  };

  // Workout control
  const startWorkout = async () => {
    const validExercises = exercises.filter(e => e.trim());
    if (validExercises.length === 0) return;

    await requestWakeLock();
    setWorkoutStartTime(new Date());
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setScreen('exercise');
    startTimer(exerciseDuration);
  };

  const endWorkout = () => {
    stopTimer();
    setWorkoutEndTime(new Date());
    setTotalSets(currentSet);
    setScreen('complete');
    releaseWakeLock();
  };

  const resetWorkout = () => {
    stopTimer();
    setScreen('config');
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimeRemaining(0);
    setIsPaused(false);
    setWorkoutStartTime(null);
    setWorkoutEndTime(null);
    setTotalSets(0);
    releaseWakeLock();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get valid exercises
  const validExercises = exercises.filter(e => e.trim());
  const currentExercise = validExercises[currentExerciseIndex];
  const nextExercise = validExercises[currentExerciseIndex + 1];

  // Progress calculation
  const exerciseProgress = screen === 'exercise' || screen === 'rest'
    ? (currentExerciseIndex + 1) / validExercises.length
    : 0;

  // Circle progress
  const getCircleProgress = () => {
    const duration = screen === 'exercise' ? exerciseDuration : screen === 'rest' ? restDuration : 30;
    return ((duration - timeRemaining) / duration) * 100;
  };

  const CircleTimer = ({ time, progress, size = 200 }) => {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={screen === 'exercise' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={screen === 'exercise' ? '#ffffff' : '#ffffff'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute text-white font-bold" style={{ fontSize: size * 0.15 }}>
          {time}
        </div>
      </div>
    );
  };

  // Screen components
  if (screen === 'config') {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Workout Timer</h1>

          {/* Exercise List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Exercises</h2>
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-800 rounded-lg p-2"
                  draggable={exercise.trim() && index < exercises.length - 1}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {exercise.trim() && index < exercises.length - 1 && (
                    <GripVertical className="text-gray-400 cursor-move" size={20} />
                  )}
                  <input
                    type="text"
                    value={exercise}
                    onChange={(e) => updateExercise(index, e.target.value)}
                    placeholder="Enter exercise name"
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                  />
                  {exercise.trim() && index < exercises.length - 1 && (
                    <button
                      onClick={() => removeExercise(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Configuration */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-lg font-semibold mb-2">Exercise Duration</label>
              <select
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-lg text-lg"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}s</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Rest Duration</label>
              <select
                value={restDuration}
                onChange={(e) => setRestDuration(Number(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-lg text-lg"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}s</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startWorkout}
            disabled={validExercises.length === 0}
            className={`w-full py-4 rounded-lg text-xl font-bold ${
              validExercises.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Start Workout
          </button>

          {/* Share Button */}
          {validExercises.length > 0 && (
            <button
              onClick={() => navigator.clipboard.writeText(generateShareURL())}
              className="w-full mt-4 py-3 rounded-lg text-lg font-semibold bg-gray-700 text-white hover:bg-gray-600"
            >
              Copy Share Link
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'exercise') {
    return (
      <div className="min-h-screen bg-orange-500 text-white flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-orange-600 h-2">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${exerciseProgress * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Current Exercise */}
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
            {currentExercise}
          </h1>

          {/* Timer */}
          <div className="mb-8">
            <CircleTimer time={timeRemaining} progress={getCircleProgress()} size={250} />
          </div>

          {/* Pause/Resume Button */}
          <button
            onClick={isPaused ? resumeTimer : pauseTimer}
            className="bg-white text-orange-500 px-8 py-4 rounded-full font-bold text-xl flex items-center gap-2 hover:bg-gray-100"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* End Workout */}
          <button
            onClick={endWorkout}
            className="mt-4 text-white underline text-lg"
          >
            End Workout
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'rest') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        {/* Current Set */}
        <h2 className="text-2xl font-semibold mb-4">Set {currentSet}</h2>

        {/* Timer */}
        <div className="mb-8">
          <CircleTimer time={timeRemaining} progress={getCircleProgress()} size={200} />
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
          onClick={isPaused ? resumeTimer : pauseTimer}
          className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-gray-200"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        {/* End Workout */}
        <button
          onClick={endWorkout}
          className="mt-4 text-white underline text-lg"
        >
          End Workout
        </button>
      </div>
    );
  }

  if (screen === 'betweenSets') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        {/* Congratulations */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Set {currentSet} Complete!
        </h1>
        <p className="text-xl text-gray-400 mb-8 text-center">Great job!</p>

        {/* Timer */}
        <div className="mb-8">
          <CircleTimer time={timeRemaining} progress={getCircleProgress()} size={180} />
        </div>

        <p className="text-lg text-gray-400 mb-8 text-center">
          Next set starts automatically in {timeRemaining}s
        </p>

        {/* End Workout Button */}
        <button
          onClick={endWorkout}
          className="bg-red-500 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-600"
        >
          End Workout
        </button>
      </div>
    );
  }

  if (screen === 'complete') {
    const workoutDuration = workoutEndTime && workoutStartTime
      ? workoutEndTime - workoutStartTime
      : 0;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
          Great Job!
        </h1>

        <div className="text-center space-y-4">
          <p className="text-2xl">
            You completed <span className="font-bold text-orange-500">{totalSets}</span> set{totalSets !== 1 ? 's' : ''}
          </p>
          <p className="text-xl text-gray-400">
            Total time: {formatDuration(workoutDuration)}
          </p>
        </div>

        <button
          onClick={resetWorkout}
          className="mt-12 bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-orange-600"
        >
          New Workout
        </button>
      </div>
    );
  }

  return null;
};

export default WorkoutApp;