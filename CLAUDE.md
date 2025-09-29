# Workout Timer - Development Guide

A React + TypeScript workout timer app for GitHub Pages deployment.

📋 **Project docs**: [README.md](README.md) • [SPECIFICATIONS.md](SPECIFICATIONS.md)

## Bash Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

## Architecture Guidelines

**Start Simple**: Begin with minimal working solution, avoid premature features
**Clear Boundaries**: Separate external concerns from domain logic
**KISS Principle**: Only add complexity when there's immediate need
**SOLID Patterns**: Follow separation of concerns

### Project Structure
```
src/
├── components/screens/    # Main app screens (5 total)
├── components/ui/         # Reusable UI components  
├── hooks/                 # Custom React hooks
├── utils/                 # Pure utility functions
└── types/                 # TypeScript definitions
```

### Code Style

- Use TypeScript strict mode
- Prefer custom hooks for stateful logic
- Component props: explicit interfaces
- Functions: descriptive names, single responsibility
- Imports: organize by external/internal, destructure when possible

## Implementation Order

1. **Core Setup**: Vite project, TypeScript, Tailwind, linting
2. **Types & Hooks**: Define workout types, implement timer/audio hooks
3. **Components**: Build screen components using hooks
4. **Features**: Add persistence, URL sharing, wake lock
5. **Polish**: Circular timer animation, drag-and-drop

## Workflow

**Development Testing Protocol:**
- Always run `npm run typecheck` after code changes
- Always run `npm run lint` to check code quality
- Test UI changes with MCP Playwright browser testing before committing
- Format code before commits: `npm run format`
- Test audio features in real browser (not just dev server)
- Verify wake lock on mobile devices

**UI Testing with MCP Playwright:**
When making UI/rendering changes, use browser testing to verify:
1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173` in MCP Playwright browser
3. Test key user flows: configuration → exercise → rest → completion
4. Verify responsive design and mobile viewport behavior
5. Check timer animations and state transitions work correctly

## Technical Notes

- **Audio**: Use Web Audio API directly (no Tone.js needed)
- **Wake Lock**: Handle both new WakeLock API and navigator.wakeLock fallback
- **Persistence**: LocalStorage + URL query params (not hash)
- **Drag & Drop**: Native HTML5 API, no external libraries

## Development Focus

This is a frontend-only app prioritizing:
- Reliability over features
- Mobile experience over desktop
- Performance over animations
- Accessibility over aesthetics