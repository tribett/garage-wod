# Contributing to Garage WOD

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/garage-wod.git
cd garage-wod
pnpm install
pnpm dev
```

## Project Structure

```
src/
  components/   UI components (ui/, layout/, history/, etc.)
  contexts/     React contexts (Settings, Program, WorkoutLog)
  data/         Built-in program data
  hooks/        Custom hooks (timer, audio, wake lock, etc.)
  lib/          Pure utility functions
  pages/        Route-level page components
  types/        TypeScript type definitions
public/
  sounds/       Timer audio files
  *.png         PWA icons
```

## Guidelines

- **Keep it simple.** This app should stay lightweight and dependency-minimal.
- **No backend.** All state lives in localStorage.
- **Mobile-first.** Design for phone screens in a garage.
- **Accessibility matters.** Use semantic HTML, proper ARIA attributes, and keyboard navigation.

## Submitting Changes

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `pnpm build` to verify the build passes
4. Open a pull request with a clear description

## Custom Program Contributions

If you've created a workout program JSON that others might enjoy, feel free to submit it! See [`docs/SCHEMA.md`](docs/SCHEMA.md) for the schema format.
