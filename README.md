# GRGWOD

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-605%20passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)]()
[![PWA](https://img.shields.io/badge/PWA-installable-purple.svg)]()

A mobile-first PWA for tracking CrossFit-style garage gym workouts. Ships with a 12-week "Return to CrossFit" program, an in-app program builder, standalone WOD logger, and full PR tracking — all offline, zero backend.

**[Live Demo](https://garage-wod.vercel.app)** · **[Report Bug](https://github.com/tribett/garage-wod/issues)** · **[Request Feature](https://github.com/tribett/garage-wod/issues)**

## Features

### Core
- **12-week program** — progressive phases from light movement to full CrossFit WODs
- **In-app program builder** — create custom programs with a step-by-step wizard
- **Standalone WOD logger** — log any CrossFit WOD with type, movements, and score
- **Workout timer** — AMRAP, EMOM, For Time, Tabata, and Rounds modes with audio cues
- **Progressive logging** — one-tap complete, optional weight entry, detailed set tracking
- **PR detection & celebration** — automatic personal record tracking with in-app celebration
- **Exercise history** — weight progression charts and movement history

### Smart Coaching
- **Equipment checklist** — auto-detects gear needed for each workout
- **Warm-up generator** — personalized warm-ups based on today's movements
- **Difficulty predictor** — rates workout intensity (1-10) using your PR history
- **Movement swap engine** — suggests alternatives for missing equipment or injuries
- **Plate calculator** — visual barbell loading with colored plates

### Competition & Fun
- **Whiteboard mode** — full-screen dark display for your garage wall
- **Competition sounds** — procedural audio cues (3-2-1-Go!, time cap warnings)
- **Ghost racer** — pace yourself against your previous best time
- **Partner WOD mode** — track work/rest splits for two athletes
- **WOD spinner** — random workout generator when you need inspiration
- **Voice logging** — hands-free weight entry via speech recognition

### Progress & Motivation
- **Achievement system** — 12 unlockable badges (First Blood, Century Club, Iron Week, etc.)
- **Monthly & yearly recaps** — training volume summaries and PR highlights
- **Score comparisons** — see improvement across repeated WODs
- **What-if calculator** — project PRs at different rep ranges using Epley/Brzycki formulas
- **Goal tracking** — set and monitor personal fitness goals

### Platform
- **Dark mode** — light, dark, and system theme options
- **Offline-first** — full PWA with service worker, install to your home screen
- **Data portability** — export/import full backups as JSON
- **Self-hosted** — Docker support, no external services required
- **Zero backend** — all data stored in localStorage

## Quick Start

**Prerequisites:** Node.js 18+ and pnpm 9+

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing

```bash
pnpm test          # run all 605 tests
pnpm test:watch    # watch mode for development
```

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

- React 19 + TypeScript (strict mode)
- Vite 7
- Tailwind CSS v4
- vite-plugin-pwa (Workbox)
- Vitest + React Testing Library (605 tests)
- Web Speech API (voice logging)
- Web Audio API (competition sounds)
- No backend, no database, no npm runtime dependencies beyond React

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, project structure, and guidelines.

## License

[MIT](LICENSE)
