# Workouts

A minimalist, mobile-first workout timer for custom strength training sessions. Create your exercise routine, set timers, and follow guided workout sessions with audio cues and visual feedback.

**Live**: https://getvega.github.io/workouts/

## Features

- **Custom Exercise Lists**: Add, remove, and reorder exercises with drag-and-drop
- **Flexible Timing**: Configure exercise and rest durations (15s to 3 minutes)
- **Visual Feedback**: High-contrast UI with orange exercise mode and dark rest mode
- **Audio Cues**: Synthesized beeps for countdown warnings and set completion
- **Progress Tracking**: Visual progress bars and set counters
- **Session Persistence**: Save configurations to localStorage and share via URL
- **Mobile-Optimized**: Responsive design with wake lock to prevent screen sleep
- **Offline Ready**: Fully client-side application, no server required

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Configure**: Add exercises and set durations on the main screen
2. **Start**: Begin your workout with the "Start Workout" button
3. **Follow**: Exercise phases show orange background, rest phases show dark background
4. **Complete**: Review your session summary and start a new workout

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Web Audio API** for reliable sound synthesis
- **HTML5 Drag & Drop API** for exercise reordering
- **Wake Lock API** for screen management

## Browser Support

Modern browsers with support for:

- Web Audio API
- Wake Lock API (mobile)
- HTML5 Drag & Drop
- Local Storage

## Development

See [CLAUDE.md](CLAUDE.md) for development guidelines and [SPECIFICATIONS.md](SPECIFICATIONS.md) for detailed feature specifications.
