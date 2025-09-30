# CLAUDE.md

AI development guide for the workouts application.

## Project Overview

This is a minimalist, mobile-first workout timer application built with React 19 + TypeScript. The app operates entirely client-side with a focus on reliability, high-contrast UI, and comprehensive audio/vibration feedback.

### Documentation Structure
- **[@README.md](README.md)**: Features overview, tech stack, usage instructions
- **[@SPECIFICATIONS.md](SPECIFICATIONS.md)**: Detailed UI/UX design, core vision, feature specifications  
- **[@CLAUDE.md](CLAUDE.md)**: AI development guide, architecture, testing protocols

## Architecture & Development Guidelines

### Core Principles
- **Start Simple**: Begin with minimal working solution, avoid premature features
- **Clear Boundaries**: Separate external concerns from domain logic using React Context
- **KISS Principle**: Only add complexity when there's immediate need
- **SOLID Patterns**: Follow separation of concerns, each screen manages its own timer

### Project Structure
```
src/
├── components/screens/    # Main app screens (ConfigScreen, ExerciseScreen, RestScreen, BetweenSetsScreen, CompleteScreen)
├── components/ui/         # Reusable UI components (CircularTimer, ProgressBar, Button)
├── contexts/             # React Context providers (WorkoutProvider, WorkoutContext)
├── hooks/                # Custom React hooks (useTimer, useAudio, useVibration, useOnMountUnsafe)
├── utils/                # Pure utility functions
└── types/                # TypeScript definitions
```

### Code Style & Standards
- **TypeScript**: Strict mode enabled, explicit interfaces for component props
- **React Patterns**: Custom hooks for stateful logic, context for state management
- **Functions**: Descriptive names, single responsibility principle
- **Imports**: Organize external/internal, destructure when possible
- **Comments**: Only add when explicitly requested by user

### Critical Implementation Details
- **React StrictMode**: App runs in StrictMode causing double execution in development
- **useOnMountUnsafe Hook**: Custom hook prevents double execution using ref-based pattern
- **Timer Management**: Each screen manages its own timer instance, uses refs to avoid re-renders
- **State Updates**: Use setTimeout(fn, 0) to break synchronous update chains and prevent "Cannot update component while rendering" errors

## Development Workflow

### Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run deploy` - Deploy to GitHub Pages

### Development Protocol
1. **Always run after code changes**: `npm run typecheck` → `npm run lint` → `npm run build`
2. **Test UI changes**: Use MCP Playwright browser testing before committing
3. **Audio testing**: Verify in real browser (dev server audio can be unreliable)
4. **Mobile testing**: Verify wake lock and touch interactions on actual devices
5. **Format before commits**: `npm run format`

### Quick Testing Setup
**Test URL**: `http://localhost:5173/workouts/?exercises=Push-ups%2CSquats&exerciseTime=15&restTime=15`
- Pre-configured with 2 exercises and 15-second timers for rapid testing
- Always test at least 2 complete sets to verify full workout flow

## Testing & Validation

### Console Debugging Protocol
Always monitor browser console for these key logs:
```
🚀 STARTING WORKOUT: { exercises: [...], totalSegments: N, exerciseDuration: X, restDuration: Y }
✅ EXERCISE COMPLETE: ExerciseName (index: N, segment: X→Y)
🔄 REST COMPLETE: transitioning to NextExercise (segment: X→Y)
🎯 SET N COMPLETE - transitioning to between sets
⏱️ BETWEEN SETS: 30s break before Set N+1
🏁 WORKOUT COMPLETE: N sets finished
```

**Error Monitoring**:
- No "Cannot update component while rendering" errors
- Exercise index stays within bounds (0 to N-1 for N exercises)
- Segment index progresses correctly (0 to 2N-1 for N exercises)

### User Acceptance Testing

#### Core Workflow Validation
1. **Configuration Screen**: Verify exercise list, drag & drop, time dropdowns, "Start Workout" button
2. **Exercise Phase**: Orange background, exercise name, 15s timer, progress bar, pause/resume, audio cues (halfway beep, countdown), vibration, auto-transition
3. **Rest Phase**: Dark background, "Up next: [Exercise]", "Set N" indicator, 15s timer, countdown audio, auto-transition  
4. **Between Sets**: Dark background, "Set N Complete!", 30s timer, set completion audio/vibration, auto-transition to next set
5. **Completion**: Final message, sets completed summary, elapsed time, "New Workout" button

#### Critical Edge Cases Checklist
- ✅ Empty exercise list disables "Start Workout"
- ✅ Single exercise (no rest periods)
- ✅ End workout during any phase
- ✅ Pause/resume functionality in all timer states
- ✅ Browser refresh during active workout
- ✅ Audio works when browser is muted
- ✅ Wake lock prevents screen sleep
- ✅ Progress bar accuracy with odd/even exercise counts
- ✅ LocalStorage persistence across sessions
- ✅ URL encoding/decoding with special characters

## Technical Implementation

### Required APIs & Libraries
- **Audio**: Web Audio API (no external libraries like Tone.js)
- **Wake Lock**: Navigator.wakeLock API with fallback handling
- **Persistence**: LocalStorage + URL query params (not hash)
- **Drag & Drop**: Native HTML5 API (no external libraries)

### Known Issues & Solutions
- **React StrictMode Double Execution**: Use `useOnMountUnsafe` hook to prevent timer double-start
- **Synchronous State Updates**: Use `setTimeout(fn, 0)` to defer state updates and prevent render errors
- **Audio Reliability**: Test in real browser, not just dev server
- **Mobile Wake Lock**: Verify on actual devices, not browser dev tools

### State Management Architecture
- **WorkoutContext**: Central state management using React Context API
- **Screen Independence**: Each screen component manages its own timer instance
- **Ref Pattern**: Use refs to store latest function references and prevent effect re-runs
- **Segmented Progress**: Progress tracking uses discrete segments (2N-1 for N exercises) instead of time-based calculations

## Documentation Maintenance

⚠️ **Critical**: After any major change or feature addition, review and update:
- [@README.md](README.md) for user-facing changes
- [@SPECIFICATIONS.md](SPECIFICATIONS.md) for design/feature changes  
- [@CLAUDE.md](CLAUDE.md) for architectural/development changes

## Development Focus

This frontend-only application prioritizes:
- **Reliability over features**: Robust core functionality before adding complexity
- **Mobile experience over desktop**: Touch-first design, wake lock, PWA support
- **Simplicity over complexity**: Clear code patterns, minimal dependencies