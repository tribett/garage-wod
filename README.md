# Garage WOD

A self-hosted PWA for tracking CrossFit-style garage gym workouts. Ships with a 12-week "Return to CrossFit" program and supports uploading custom programs via JSON.

## Features

- **12-week program** — progressive phases from light movement to full CrossFit WODs
- **Workout timer** — AMRAP, EMOM, For Time, Tabata, and Rounds modes with audio cues
- **Progressive logging** — one-tap complete, optional weight entry, detailed set tracking
- **PR detection** — automatic personal record tracking per movement
- **Exercise history** — weight progression charts and movement history
- **Dark mode** — light, dark, and system theme options
- **Offline-first** — full PWA with service worker caching
- **Custom programs** — upload your own workout programs via JSON
- **Self-hosted** — Docker support, no external services required
- **Zero backend** — all data stored in localStorage

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Docker

```bash
docker compose up -d
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Custom Programs

Create a JSON file following the schema documented in [`docs/SCHEMA.md`](docs/SCHEMA.md) and upload it through Settings > Custom Program.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- vite-plugin-pwa (Workbox)
- No backend, no database

## License

[MIT](LICENSE)
