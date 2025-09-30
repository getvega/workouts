import { createContext } from 'react';
import type { WorkoutContextType } from './WorkoutTypes';

export const WorkoutContext = createContext<WorkoutContextType | null>(null);