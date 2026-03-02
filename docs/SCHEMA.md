# Program JSON Schema

Garage WOD accepts custom workout programs via JSON upload. This document describes the expected format.

## Top-Level Structure

```json
{
  "id": "my-program",
  "name": "My Custom Program",
  "author": "Your Name",
  "description": "A brief description of the program",
  "version": "1.0.0",
  "phases": [...]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (kebab-case recommended) |
| `name` | string | yes | Display name |
| `author` | string | yes | Program author |
| `description` | string | yes | Brief description |
| `version` | string | yes | Semver version string |
| `phases` | Phase[] | yes | One or more training phases |

## Phase

```json
{
  "name": "Foundation",
  "description": "Build base fitness with light loads",
  "weekStart": 1,
  "weekEnd": 4,
  "weeks": [...]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Phase name |
| `description` | string | yes | Phase description |
| `weekStart` | number | yes | First week number (1-indexed) |
| `weekEnd` | number | yes | Last week number (inclusive) |
| `weeks` | Week[] | yes | Weeks in this phase |

## Week

```json
{
  "weekNumber": 1,
  "days": [...]
}
```

## Day

```json
{
  "dayNumber": 1,
  "name": "Monday",
  "blocks": [...]
}
```

## Workout Block

```json
{
  "type": "wod",
  "name": "Fran",
  "description": "Classic CrossFit benchmark",
  "movements": [...],
  "scoring": { "type": "forTime", "duration": 600 }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | One of: `warmup`, `skill`, `wod`, `cooldown` |
| `name` | string | yes | Block name |
| `description` | string | no | Block description |
| `movements` | Movement[] | yes | List of movements |
| `scoring` | WodScoring | no | Timer/scoring config (WOD blocks only) |

## Movement

```json
{
  "id": "w1d1-wod-thruster",
  "name": "Thrusters",
  "sets": 3,
  "reps": 10,
  "weight": "95 lbs",
  "notes": "Use light weight"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique across the entire program |
| `name` | string | yes | Movement name |
| `sets` | number | no | Number of sets |
| `reps` | number or string | no | Reps per set (string for ranges like "8-12") |
| `weight` | string | no | Suggested weight |
| `duration` | number | no | Duration in seconds |
| `distance` | string | no | Distance (e.g., "500m") |
| `notes` | string | no | Additional notes |
| `rest` | number | no | Rest in seconds between sets |

## WOD Scoring

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | One of: `amrap`, `emom`, `forTime`, `tabata`, `rounds` |
| `duration` | number | no | Total duration in seconds |
| `interval` | number | no | Interval duration in seconds (EMOM) |
| `rounds` | number | no | Number of rounds |
| `workInterval` | number | no | Work interval in seconds (Tabata) |
| `restInterval` | number | no | Rest interval in seconds (Tabata) |

### Scoring Examples

**AMRAP 10 minutes:**
```json
{ "type": "amrap", "duration": 600 }
```

**EMOM 12 minutes (1-minute intervals):**
```json
{ "type": "emom", "duration": 720, "interval": 60, "rounds": 12 }
```

**For Time (12-minute cap):**
```json
{ "type": "forTime", "duration": 720 }
```

**Tabata (8 rounds, 20s on / 10s off):**
```json
{ "type": "tabata", "workInterval": 20, "restInterval": 10, "rounds": 8 }
```

**3 Rounds (no time cap):**
```json
{ "type": "rounds", "rounds": 3 }
```

## Validation

The app validates uploaded JSON against these rules:
- All required fields must be present
- Movement IDs must be unique across the entire program
- Block types and WOD types must use valid values
- Phase week ranges must not overlap
- Each phase must contain at least one week
- Each week must contain at least one day
