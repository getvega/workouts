import React, { useEffect } from 'react';
import { BetweenSetsScreen } from './components/screens/BetweenSetsScreen';
import { CompleteScreen } from './components/screens/CompleteScreen';
import { ConfigurationScreen } from './components/screens/ConfigurationScreen';
import { ExerciseScreen } from './components/screens/ExerciseScreen';
import { RestScreen } from './components/screens/RestScreen';
import { WorkoutProvider } from './contexts/WorkoutProvider';
import { useWorkout } from './hooks/useWorkoutContext';
import { useWakeLock } from './hooks/useWakeLock';

const AppContent: React.FC = () => {
  const { screen, session } = useWorkout();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  // Handle wake lock during workout
  useEffect(() => {
    const isActiveWorkout = screen === 'exercise' || screen === 'rest' || screen === 'betweenSets';
    
    if (isActiveWorkout) {
      requestWakeLock();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          requestWakeLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('fullscreenchange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleVisibilityChange);
      };
    } else {
      releaseWakeLock();
    }
  }, [screen, requestWakeLock, releaseWakeLock]);

  // Screen rendering
  switch (screen) {
    case 'config':
      return <ConfigurationScreen />;

    case 'exercise':
      return <ExerciseScreen />;

    case 'rest':
      return <RestScreen />;

    case 'betweenSets':
      return <BetweenSetsScreen />;

    case 'complete': {
      const workoutDuration = session?.endTime && session?.startTime
        ? session.endTime.getTime() - session.startTime.getTime()
        : 0;

      return <CompleteScreen workoutDuration={workoutDuration} />;
    }

    default:
      return null;
  }
};

const App: React.FC = () => {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
};

export default App;
