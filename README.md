# GRGWOD

A mobile-first PWA for tracking CrossFit-style garage gym workouts. Ships with a 12-week "Return to CrossFit" program, an in-app program builder, standalone WOD logger, and full PR tracking.

## Features

- **12-week program** — progressive phases from light movement to full CrossFit WODs
- **In-app program builder** — create custom programs with a step-by-step wizard
- **Standalone WOD logger** — log any CrossFit WOD with type, movements, and score
- **Workout timer** — AMRAP, EMOM, For Time, Tabata, and Rounds modes with audio cues
- **Progressive logging** — one-tap complete, optional weight entry, detailed set tracking
- **PR detection & celebration** — automatic personal record tracking with in-app celebration
- **Exercise history** — weight progression charts and movement history
- **Dark mode** — light, dark, and system theme options
- **Offline-first** — full PWA with service worker, install to your home screen
- **Custom programs** — build in-app or upload via JSON
- **Data portability** — export/import full backups as JSON
- **Self-hosted** — Docker support, no external services required
- **Zero backend** — all data stored in localStorage

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploy

GRGWOD is a static site — deploy anywhere that serves HTML.

**Vercel / Netlify:**
Connect your GitHub repo and it auto-detects Vite. No configuration needed.

**Docker:**

```bash
docker compose up -d
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Custom Programs

You have two options:

1. **In-app builder** — Go to Program > "+ New" and use the step-by-step wizard
2. **JSON upload** — Create a JSON file following [`docs/SCHEMA.md`](docs/SCHEMA.md) and upload via Settings

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- vite-plugin-pwa (Workbox)
- Vitest + React Testing Library
- No backend, no database

## License

[MIT](LICENSE)
