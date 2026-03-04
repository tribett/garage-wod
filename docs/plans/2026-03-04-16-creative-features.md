# 16 Creative CrossFit UX Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform grgwod from a solid workout tracker into a joyful, addictive, uniquely garage-athlete-focused experience with 16 new features across 4 themes.

**Architecture:** Each feature is a pure-logic TypeScript module with comprehensive tests, plus UI component(s) wired into existing pages. All features use localStorage for persistence (no backend). Weather uses a free API. Voice uses Web Speech API. Audio uses bundled base64-encoded short clips.

**Tech Stack:** React 19, TypeScript, Vitest 4, Tailwind CSS v4, vite-plugin-pwa, Web Speech API, Web Audio API

---

## Batching Strategy

Features are organized into 6 batches to avoid file conflicts when running parallel agents.

### Batch 1: Pure Logic — Garage Athlete's Best Friend (4 parallel agents)
All create new lib files + new test files. No page modifications.

| Task | New Files | Touches Pages |
|------|-----------|---------------|
| 1. Plate Calculator | plate-calculator.ts | None (pure logic) |
| 2. Equipment Checklist | equipment-checklist.ts | None (pure logic) |
| 3. Warm-Up Generator | warmup-generator.ts | None (pure logic) |
| 4. Movement Swap Engine | movement-swap.ts | None (pure logic) |

### Batch 2: Pure Logic — Addictive Progress (4 parallel agents)

| Task | New Files | Touches Pages |
|------|-----------|---------------|
| 5. Achievement System | achievements.ts | None (pure logic) |
| 6. What-If PR Calculator | what-if-calculator.ts | None (pure logic) |
| 7. Score Comparisons | score-comparisons.ts | None (pure logic) |
| 8. Monthly/Yearly Recaps | recaps.ts | None (pure logic) |

### Batch 3: Pure Logic — Competition Floor + Weird Ones (4 parallel agents)

| Task | New Files | Touches Pages |
|------|-----------|---------------|
| 9. Difficulty Predictor | difficulty-predictor.ts | None (pure logic) |
| 10. WOD Random Generator | wod-generator.ts | None (pure logic) |
| 11. Ghost Race Mode | ghost-racer.ts | None (pure logic) |
| 12. Competition Sounds | competition-sounds.ts | None (pure logic) |

### Batch 4: Pure Logic — Remaining (2 parallel agents)

| Task | New Files | Touches Pages |
|------|-----------|---------------|
| 13. Voice Logging | voice-logger.ts | None (pure logic) |
| 14. Partner WOD Mode | partner-wod.ts | None (pure logic) |

### Batch 5: UI Components (4 parallel agents)
Each creates new standalone component files. No page modifications.

| Task | New Files |
|------|-----------|
| 15a. PlateCalculator.tsx | New component only |
| 15b. AchievementBadge.tsx + RecapCard.tsx | New components only |
| 15c. WhiteboardMode.tsx | New component only |
| 15d. WodSpinner.tsx + GhostPacer.tsx | New components only |

### Batch 6: Page Integration (sequential, one agent)
Wire all components into pages. This batch is sequential because it modifies shared page files.

---

## Task 1: Plate Calculator

**Files:**
- Create: `src/lib/plate-calculator.ts`
- Create: `src/lib/__tests__/plate-calculator.test.ts`

**Context:** CrossFit athletes constantly do mental math to figure out which plates go on each side of the bar. This module calculates the exact plate combination needed for a target weight, accounting for bar weight and available plate inventory.

**Types & API:**
```typescript
export interface PlateSet {
  weight: number  // plate weight in lbs/kg
  count: number   // number of this plate (per side)
  color: string   // standard color: red=55/25, blue=45/20, yellow=35/15, green=25/10, white=10/5, black=5/2.5, silver=2.5/1.25
}

export interface PlateLoadout {
  targetWeight: number
  barWeight: number
  perSide: PlateSet[]
  totalLoaded: number
  remainder: number  // leftover weight that can't be loaded
}

export const STANDARD_PLATES_LBS: number[] = [55, 45, 35, 25, 15, 10, 5, 2.5]
export const STANDARD_PLATES_KG: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]

export const PLATE_COLORS: Record<number, string> = {
  55: '#ef4444', 45: '#3b82f6', 35: '#eab308', 25: '#22c55e',
  15: '#f97316', 10: '#6b7280', 5: '#1f2937', 2.5: '#9ca3af',
  // kg
  20: '#3b82f6', 1.25: '#9ca3af',
}

export function calculatePlates(
  targetWeight: number,
  barWeight?: number,     // default 45 lbs / 20 kg
  unit?: 'lbs' | 'kg',
  availablePlates?: number[]  // custom inventory
): PlateLoadout

export function formatPlateLoadout(loadout: PlateLoadout): string
// → "45 + 25 + 10 per side" or "Just the bar"
```

**Tests (13 tests):**
1. returns empty perSide when target equals bar weight (45 lbs → "just the bar")
2. calculates single plate pair (135 lbs → one 45 per side)
3. calculates mixed plates (225 lbs → two 45s + one 25 per side... wait no: 225 - 45 = 180, 180/2 = 90 per side = 45+45... that's 225. Actually 225 = bar(45) + 2×(45+45) = 45 + 180 = 225. So 90 per side = 45+45)
4. handles odd weights with remainder (227 lbs → loads 225, remainder 2)
5. works with kg plates and 20kg bar
6. uses custom available plates when provided
7. returns all zeros for weight less than bar weight
8. handles 0 weight input
9. formats "Just the bar" for bar-weight-only
10. formats single plate pair as "45 per side"
11. formats mixed plates as "45 + 25 + 10 per side"
12. assigns correct standard colors to each plate weight
13. greedy algorithm picks largest plates first

---

## Task 2: Equipment Checklist

**Files:**
- Create: `src/lib/equipment-checklist.ts`
- Create: `src/lib/__tests__/equipment-checklist.test.ts`

**Context:** Scans a day's workout blocks and movements to produce a list of equipment needed. Prevents mid-WOD trips across the garage.

**Types & API:**
```typescript
export type EquipmentItem =
  | 'barbell' | 'dumbbells' | 'kettlebell' | 'pull-up bar' | 'rings'
  | 'box' | 'jump rope' | 'wall ball' | 'slam ball' | 'medicine ball'
  | 'ab mat' | 'rower' | 'bike' | 'ski erg' | 'rope'
  | 'bench' | 'rack' | 'plates' | 'resistance band' | 'ghd'

export interface EquipmentList {
  items: EquipmentItem[]
  plates?: { weight: number; count: number }[]  // specific plates needed if barbell movements present
}

// Maps movement names (lowercase) to equipment needed
export const EQUIPMENT_MAP: Record<string, EquipmentItem[]>

export function getEquipmentForDay(blocks: WorkoutBlock[]): EquipmentList
```

**Tests (11 tests):**
1. returns barbell + plates for back squat
2. returns pull-up bar for pull-ups
3. returns jump rope for double-unders
4. returns box for box jumps
5. returns kettlebell for KB swings
6. deduplicates equipment across multiple blocks
7. returns empty list for bodyweight-only workouts (air squats, burpees)
8. includes dumbbells for DB movements
9. includes rower for rowing movements
10. returns rings for ring dips and muscle-ups
11. identifies plates needed from weight annotations in movements

---

## Task 3: Smart Warm-Up Generator

**Files:**
- Create: `src/lib/warmup-generator.ts`
- Create: `src/lib/__tests__/warmup-generator.test.ts`

**Context:** Given today's programmed movements, generates a contextual dynamic warm-up targeting the muscle groups and movement patterns that will be used.

**Types & API:**
```typescript
export interface WarmUpExercise {
  name: string
  duration?: string    // "30 seconds" or "10 reps"
  category: 'general' | 'mobility' | 'activation' | 'buildup'
}

export interface WarmUpRoutine {
  exercises: WarmUpExercise[]
  estimatedMinutes: number
  targetAreas: string[]  // e.g. ["hips", "shoulders", "ankles"]
}

// Maps movement categories to warm-up exercises
export const WARMUP_LIBRARY: Record<MovementCategory, WarmUpExercise[]>

export function generateWarmUp(
  movements: { name: string }[],
  durationMinutes?: number  // target warm-up length, default 8
): WarmUpRoutine
```

**Tests (12 tests):**
1. generates hip-focused warm-up for squat day
2. generates shoulder warm-up for pressing movements
3. includes general cardio opener (jumping jacks or row) always
4. includes build-up sets when barbell movements present
5. limits to target duration (default 8 min)
6. handles mixed movement days (squat + press + cardio)
7. returns minimal warm-up for cardio-only days
8. includes ankle mobility for overhead squat
9. does not duplicate exercises across categories
10. returns empty for empty movement list
11. estimates total duration based on exercise count
12. identifies target areas from movement list

---

## Task 4: Movement Swap Engine

**Files:**
- Create: `src/lib/movement-swap.ts`
- Create: `src/lib/__tests__/movement-swap.test.ts`

**Context:** Suggests equivalent movement substitutions when equipment is unavailable or an athlete has injuries. Builds on existing MOVEMENT_SCALING data but adds equipment-based and injury-based alternatives.

**Types & API:**
```typescript
export type SwapReason = 'equipment' | 'injury' | 'preference'

export interface SwapSuggestion {
  original: string
  alternative: string
  reason: SwapReason
  category: MovementCategory  // same movement category
  notes?: string  // e.g. "maintain similar stimulus"
}

// Maps equipment to movements that require it
export const EQUIPMENT_REQUIREMENTS: Record<string, string[]>

// Maps body regions to movements that stress them
export const INJURY_MAP: Record<string, string[]>

export function getSwaps(
  movementName: string,
  reason: SwapReason,
  detail?: string  // e.g. "shoulder" for injury, "rower" for equipment
): SwapSuggestion[]

export function getEquipmentAlternatives(movementName: string, missingEquipment: string): SwapSuggestion[]
export function getInjuryAlternatives(movementName: string, bodyRegion: string): SwapSuggestion[]
```

**Tests (14 tests):**
1. suggests run alternative when rower unavailable
2. suggests DB alternative when no barbell
3. suggests ring row when no pull-up bar
4. returns empty array for unknown movement
5. suggests push-up alternatives for shoulder injury
6. suggests squat alternatives for knee injury
7. all alternatives stay in same movement category
8. provides notes explaining the swap rationale
9. handles case-insensitive movement names
10. suggests bike/ski/jump rope as cardio alternatives
11. suggests KB swing for no-barbell deadlift
12. returns multiple options sorted by similarity
13. equipment alternatives don't include the missing equipment
14. injury alternatives avoid the injured body region

---

## Task 5: Achievement System

**Files:**
- Create: `src/lib/achievements.ts`
- Create: `src/lib/__tests__/achievements.test.ts`

**Context:** Gamification through unlockable badges that feel earned. Each achievement has a condition function that checks workout history. Achievements persist in localStorage.

**Types & API:**
```typescript
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string       // emoji
  tier: AchievementTier
  unlockedAt?: string
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  tier: AchievementTier
  check: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  logs: WorkoutLog[]
  prs: Map<string, { value: number; reps: number }>
  bodyweight?: number
  streakWeeks: number
}

export const ACHIEVEMENTS: AchievementDefinition[]
// Examples:
// - "First Blood" (bronze): Complete first workout
// - "Century Club" (silver): 100 workouts logged
// - "Iron Week" (gold): 5 workouts in one week
// - "Dawn Patrol" (bronze): Log before 6 AM
// - "Rx Machine" (silver): 10 consecutive Rx WODs
// - "Bodyweight Snatch" (gold): Snatch ≥ bodyweight
// - "Double Bodyweight Deadlift" (legendary): Deadlift ≥ 2× bodyweight
// - "The Murph" (gold): Complete a Murph WOD
// - "Streak Master" (silver): 8-week training streak
// - "PR Parade" (bronze): 3 PRs in one session
// - "Year-Round" (legendary): Log at least 1 workout every month for 12 months
// - "Fran Sub-5" (legendary): Fran under 5:00

export function checkAchievements(ctx: AchievementContext, alreadyUnlocked: string[]): Achievement[]
export function getUnlockedAchievements(): Achievement[]  // from localStorage
export function saveUnlockedAchievements(achievements: Achievement[]): void
```

**Tests (15 tests):**
1. "First Blood" unlocks on first completed workout
2. "Century Club" unlocks at 100 workouts
3. "Iron Week" unlocks with 5 workouts in same calendar week
4. "Dawn Patrol" unlocks when completedAt hour < 6
5. "Bodyweight Snatch" checks snatch PR vs bodyweight
6. "Double Bodyweight Deadlift" checks deadlift PR vs 2× bodyweight
7. does not re-unlock already-unlocked achievements
8. returns empty array when no new achievements earned
9. multiple achievements can unlock simultaneously
10. "Streak Master" checks streak ≥ 8
11. persists unlocked achievements to localStorage
12. loads unlocked achievements from localStorage
13. handles missing bodyweight gracefully (skips BW-based achievements)
14. "Rx Machine" counts consecutive Rx scaling entries
15. "Fran Sub-5" parses Fran WOD score as forTime under 300 seconds

---

## Task 6: What-If PR Calculator

**Files:**
- Create: `src/lib/what-if-calculator.ts`
- Create: `src/lib/__tests__/what-if-calculator.test.ts`

**Context:** Athletes daydream about hitting PRs. This module takes a hypothetical weight and shows what it would mean — the PR improvement, bodyweight ratio, estimated 1RM change, and percentage table shift.

**Types & API:**
```typescript
export interface WhatIfResult {
  movement: string
  hypotheticalWeight: number
  currentPR: number | null
  prImprovement: number | null       // e.g. +15 lbs
  prImprovementPct: number | null    // e.g. +5.8%
  bodyweightRatio: number | null     // e.g. 1.52×
  estimated1RM: number               // Epley formula at 1 rep
  percentageTable: { percentage: number; weight: number }[]
}

export function calculateWhatIf(
  movement: string,
  hypotheticalWeight: number,
  reps: number,             // what rep count is the hypothetical for
  currentPR: number | null,
  bodyweight?: number,
  unit?: 'lbs' | 'kg',
): WhatIfResult
```

**Tests (10 tests):**
1. calculates PR improvement when current PR exists
2. returns null improvement when no current PR
3. calculates bodyweight ratio when bodyweight provided
4. returns null BW ratio when no bodyweight
5. estimates 1RM using Epley formula
6. generates percentage table from estimated 1RM
7. handles single-rep hypothetical (1RM = weight itself)
8. calculates improvement percentage
9. works with kg units
10. handles zero or negative inputs gracefully

---

## Task 7: Score Comparisons (Spicy Comparisons)

**Files:**
- Create: `src/lib/score-comparisons.ts`
- Create: `src/lib/__tests__/score-comparisons.test.ts`

**Context:** Don't just show raw scores — give context. Compare against previous attempts, show improvement rate, and generate encouraging or challenging callouts.

**Types & API:**
```typescript
export interface ScoreComparison {
  currentScore: string
  previousScore: string | null
  improvement: number | null          // raw numeric improvement
  improvementPct: number | null
  trend: 'improving' | 'plateau' | 'declining' | 'first'
  attemptNumber: number               // "This is attempt #4"
  bestScore: string
  isBest: boolean
  callout: string                     // human-friendly message
}

export function compareWodScore(
  wodName: string,
  currentScore: string,
  wodType: WodType,
  history: WorkoutLog[],
): ScoreComparison

export function generateCallout(comparison: ScoreComparison, wodType: WodType): string
// Examples:
// "23 seconds faster than last time!"
// "New personal best! You crushed it."
// "Attempt #4 — you've improved 18% since your first try."
// "Slight dip from last time, but still your 2nd best ever."
// "First time doing Fran — you've got a baseline!"
```

**Tests (12 tests):**
1. identifies first attempt (no history)
2. calculates time improvement for forTime WODs (seconds faster)
3. calculates round improvement for AMRAP WODs
4. detects new personal best
5. detects declining performance
6. detects plateau (same score ±5%)
7. generates encouraging callout for improvement
8. generates first-attempt callout
9. generates "still 2nd best" callout for decline
10. counts attempt number correctly
11. handles missing/unparseable scores gracefully
12. calculates improvement percentage

---

## Task 8: Monthly & Yearly Recaps

**Files:**
- Create: `src/lib/recaps.ts`
- Create: `src/lib/__tests__/recaps.test.ts`

**Context:** End-of-month and end-of-year summaries that make athletes feel proud of their consistency. Aggregates workouts, PRs, volume, streaks, and favorite movements.

**Types & API:**
```typescript
export interface MonthlyRecap {
  month: number           // 0-11
  year: number
  totalWorkouts: number
  totalSets: number
  totalReps: number
  estimatedVolumeLbs: number   // total weight × reps
  prsHit: number
  topMovement: string | null   // most frequently trained
  averageRPE: number | null
  activeDays: number           // unique days with workouts
  comparedToLastMonth: {
    workoutDelta: number       // +3 or -2
    volumeDelta: number
  } | null
}

export interface YearlyRecap {
  year: number
  totalWorkouts: number
  totalVolumeLbs: number
  totalPRs: number
  longestStreak: number        // consecutive weeks
  monthsActive: number         // months with ≥1 workout
  topMovements: string[]       // top 3
  averageWorkoutsPerWeek: number
  bestMonth: { month: number; workouts: number }
}

export function getMonthlyRecap(logs: WorkoutLog[], month: number, year: number): MonthlyRecap
export function getYearlyRecap(logs: WorkoutLog[], year: number): YearlyRecap
export function getCurrentMonthRecap(logs: WorkoutLog[]): MonthlyRecap
```

**Tests (14 tests):**
1. counts total workouts in given month
2. counts total sets and reps
3. estimates total volume (weight × reps)
4. counts PRs hit in the month
5. identifies most frequently trained movement
6. calculates average RPE
7. counts unique active days
8. compares to previous month with delta
9. returns null comparison for first month ever
10. yearly recap counts all workouts in year
11. yearly recap finds longest streak within year
12. yearly recap counts months with activity
13. yearly recap calculates average workouts per week
14. yearly recap identifies best month

---

## Task 9: Difficulty Predictor

**Files:**
- Create: `src/lib/difficulty-predictor.ts`
- Create: `src/lib/__tests__/difficulty-predictor.test.ts`

**Context:** Before starting a workout, predict how hard it will be based on programmed weights vs. logged PRs, movement complexity, and volume.

**Types & API:**
```typescript
export interface DifficultyPrediction {
  score: number              // 1-10 scale
  label: string              // "Light", "Moderate", "Challenging", "Brutal", "Competition-Level"
  factors: DifficultyFactor[]
  estimatedDuration?: number // minutes, if predictable
}

export interface DifficultyFactor {
  description: string        // e.g. "Back squat at 82% of estimated max"
  impact: 'low' | 'medium' | 'high'
}

export function predictDifficulty(
  blocks: WorkoutBlock[],
  prs: Map<string, { value: number; reps: number }>,
  recentRPEs: number[],      // last 5 session RPEs for calibration
  bodyweight?: number,
): DifficultyPrediction
```

**Tests (12 tests):**
1. rates bodyweight-only WOD as low difficulty
2. rates workout with weights at 90%+ max as high difficulty
3. rates workout with weights at 50-60% as low-moderate
4. accounts for total volume (more sets/reps = harder)
5. includes movement complexity (muscle-ups harder than pull-ups)
6. calibrates based on recent RPE average (if you've been rating hard, scale up)
7. returns "Light" for score 1-3
8. returns "Moderate" for score 4-5
9. returns "Challenging" for score 6-7
10. returns "Brutal" for score 8-9
11. returns "Competition-Level" for score 10
12. generates descriptive factors for each contributor

---

## Task 10: WOD Random Generator (Spin the WOD)

**Files:**
- Create: `src/lib/wod-generator.ts`
- Create: `src/lib/__tests__/wod-generator.test.ts`

**Context:** Saturday workout with no programming? Spin the slot machine. Generates a random WOD weighted toward movement categories the athlete hasn't hit recently.

**Types & API:**
```typescript
export interface GeneratedWod {
  name: string               // Fun generated name like "Garage Grinder #42"
  type: WodType
  duration?: number          // minutes for AMRAP/EMOM
  rounds?: number            // for forTime
  movements: GeneratedMovement[]
  targetCategories: MovementCategory[]
  reasoning: string          // "You haven't done hinge or pull in 8 days"
}

export interface GeneratedMovement {
  name: string
  reps: number
  weight?: string            // optional weight suggestion
  category: MovementCategory
}

// Pool of movements per category for random selection
export const MOVEMENT_POOL: Record<MovementCategory, string[]>

export function generateWod(
  recentLogs: WorkoutLog[],
  availableEquipment?: string[],
  preferredType?: WodType,
  seed?: number,             // for deterministic testing
): GeneratedWod
```

**Tests (13 tests):**
1. generates a valid WOD with 3-5 movements
2. weights toward underrepresented categories from last 14 days
3. assigns appropriate reps per movement (e.g. 12 KB swings, not 50)
4. picks AMRAP/forTime/EMOM type randomly when not specified
5. sets reasonable duration (8-20 min for AMRAP, 3-5 rounds for forTime)
6. respects preferredType parameter
7. generates unique fun name
8. provides reasoning string about gap coverage
9. filters by available equipment when provided
10. all movements are real CrossFit movements
11. does not repeat the same movement in one WOD
12. deterministic output with seed parameter
13. handles empty log history (fully random selection)

---

## Task 11: Ghost Race Mode

**Files:**
- Create: `src/lib/ghost-racer.ts`
- Create: `src/lib/__tests__/ghost-racer.test.ts`

**Context:** When retesting a WOD, show a ghost pacer representing your previous attempt. Like racing your ghost in Mario Kart.

**Types & API:**
```typescript
export interface GhostState {
  isActive: boolean
  previousTime: number       // previous total time in ms
  currentElapsed: number
  paceStatus: 'ahead' | 'behind' | 'tied'
  delta: number              // milliseconds ahead/behind (positive = ahead)
  deltaFormatted: string     // "+0:23" or "-0:05"
  progressPct: number        // 0-100, how far through the ghost's total time
}

export function createGhostFromHistory(
  wodName: string,
  logs: WorkoutLog[],
): { previousTime: number; previousScore: string } | null

export function updateGhostState(
  elapsed: number,
  previousTime: number,
): GhostState

export function formatGhostDelta(deltaMs: number): string
// +1234 → "+0:01"
// -5678 → "-0:05"
```

**Tests (11 tests):**
1. finds previous forTime result from history by WOD name
2. returns null when no previous attempt exists
3. shows "ahead" when elapsed < proportional ghost time
4. shows "behind" when elapsed > proportional ghost time
5. shows "tied" when delta is within 1 second
6. formats positive delta as "+M:SS"
7. formats negative delta as "-M:SS"
8. calculates progress percentage through ghost's total time
9. handles ghost completing (elapsed > previousTime)
10. picks most recent attempt, not best
11. case-insensitive WOD name matching

---

## Task 12: Competition Sounds

**Files:**
- Create: `src/lib/competition-sounds.ts`
- Create: `src/lib/__tests__/competition-sounds.test.ts`

**Context:** Make the garage sound like a competition floor. Short audio cues for timer events. Uses Web Audio API with base64-encoded audio snippets (tiny procedurally-generated tones).

**Types & API:**
```typescript
export type SoundEvent =
  | 'countdown_tick'    // 3, 2, 1...
  | 'go_horn'           // Starting horn
  | 'round_complete'    // End of EMOM interval
  | 'final_ten'         // Last 10 seconds warning
  | 'finish_horn'       // WOD complete
  | 'rest_start'        // Rest period begins (Tabata)
  | 'work_start'        // Work period begins (Tabata)
  | 'pr_celebration'    // New PR detected

export type SoundPack = 'competition' | 'minimal' | 'none'

export function playSound(event: SoundEvent, pack?: SoundPack): void
export function generateTone(frequency: number, duration: number, type?: OscillatorType): void
// Uses Web Audio API to create procedural sounds — no audio files needed

export function getSoundPack(): SoundPack    // from localStorage
export function setSoundPack(pack: SoundPack): void
```

**Tests (10 tests):**
1. playSound does not throw when AudioContext unavailable (SSR safety)
2. generateTone creates oscillator with correct frequency
3. generateTone stops after specified duration
4. playSound uses 'competition' pack by default
5. playSound does nothing when pack is 'none'
6. getSoundPack returns 'competition' when nothing stored
7. setSoundPack persists to localStorage
8. all SoundEvent values are handled without errors
9. 'minimal' pack plays simpler tones than 'competition'
10. sound functions are no-ops in test environment (mock AudioContext)

---

## Task 13: Voice Logging

**Files:**
- Create: `src/lib/voice-logger.ts`
- Create: `src/lib/__tests__/voice-logger.test.ts`

**Context:** Hands are chalky, phone is sweaty. Say "185 for 5" and the app logs the weight. Uses Web Speech API (SpeechRecognition).

**Types & API:**
```typescript
export interface VoiceResult {
  weight: number | null
  reps: number | null
  raw: string           // the raw transcript
  confidence: number    // 0-1
}

export function parseVoiceInput(transcript: string): VoiceResult
// Handles:
// "185 for 5" → { weight: 185, reps: 5 }
// "one eighty five" → { weight: 185, reps: null }
// "two twenty five for three" → { weight: 225, reps: 3 }
// "bodyweight" → { weight: 0, reps: null, raw: "bodyweight" }
// "135 pounds" → { weight: 135, reps: null }

export function isVoiceSupported(): boolean
// Returns true if SpeechRecognition API available

export function startListening(onResult: (result: VoiceResult) => void): () => void
// Returns a stop function
```

**Tests (12 tests):**
1. parses "185 for 5" → weight 185, reps 5
2. parses "225 for 3" → weight 225, reps 3
3. parses "135 pounds" → weight 135, reps null
4. parses "one thirty five" → weight 135
5. parses "two twenty five" → weight 225
6. parses "bodyweight" → weight 0
7. returns null weight for unparseable input
8. handles "for" and "x" and "times" as rep delimiters
9. parses "95 kilos" → weight 95
10. isVoiceSupported returns false when API unavailable
11. trims whitespace and handles mixed case
12. parses "three fifteen for two" → weight 315, reps 2

---

## Task 14: Partner WOD Mode

**Files:**
- Create: `src/lib/partner-wod.ts`
- Create: `src/lib/__tests__/partner-wod.test.ts`

**Context:** "You go, I go" partner WODs. Timer alternates between partners, tracking rounds and work for each.

**Types & API:**
```typescript
export interface PartnerState {
  activePartner: 'A' | 'B'
  partnerA: { rounds: number; totalWorkMs: number }
  partnerB: { rounds: number; totalWorkMs: number }
  switchCount: number
  lastSwitchAt: number  // elapsed ms when last switch happened
}

export function createPartnerState(): PartnerState
export function switchPartner(state: PartnerState, elapsedMs: number): PartnerState
export function getActivePartner(state: PartnerState): 'A' | 'B'
export function getPartnerSummary(state: PartnerState): {
  partnerA: { rounds: number; workTime: string }
  partnerB: { rounds: number; workTime: string }
  totalSwitches: number
}
export function formatWorkTime(ms: number): string  // "2:34"
```

**Tests (11 tests):**
1. starts with Partner A active
2. switches to B after switchPartner call
3. switches back to A on next call
4. tracks rounds per partner
5. calculates work time per partner from switch timestamps
6. counts total switches
7. formats work time as M:SS
8. handles rapid switches (0ms work time)
9. getPartnerSummary returns correct totals
10. partner rounds increment correctly on each switch
11. initial state has zero rounds and work time for both

---

## Task 15: UI Components (Batch 5)

### 15a: PlateCalculator.tsx

**Files:**
- Create: `src/components/ui/PlateCalculator.tsx`
- Create: `src/components/ui/__tests__/PlateCalculator.test.tsx`

**Design:** Visual barbell with colored plate rings. Input for target weight. Shows plates-per-side breakdown. Compact card format that fits on WorkoutPage.

**Tests (6 tests):**
1. renders target weight input
2. shows "Just the bar" for 45 lbs input
3. shows colored plate visual for 225 lbs
4. updates calculation on input change
5. shows per-side breakdown text
6. handles kg mode from settings

### 15b: AchievementBadge.tsx + RecapCard.tsx

**Files:**
- Create: `src/components/ui/AchievementBadge.tsx`
- Create: `src/components/ui/RecapCard.tsx`
- Create: `src/components/ui/__tests__/AchievementBadge.test.tsx`
- Create: `src/components/ui/__tests__/RecapCard.test.tsx`

**AchievementBadge tests (5 tests):**
1. renders achievement icon and name
2. shows tier-specific border color (bronze/silver/gold/legendary)
3. shows unlock date
4. shows locked state for unearned achievements
5. shows description on tap/hover

**RecapCard tests (5 tests):**
1. renders month name and year
2. shows total workouts count
3. shows PR count
4. shows comparison to previous month
5. shows top movement

### 15c: WhiteboardMode.tsx

**Files:**
- Create: `src/components/ui/WhiteboardMode.tsx`
- Create: `src/components/ui/__tests__/WhiteboardMode.test.tsx`

**Design:** Full-screen overlay, dark background, huge white text. Shows WOD name, movements, weights, and optional live timer. Tap to dismiss. Designed to be readable from 15+ feet.

**Tests (6 tests):**
1. renders WOD name in large text
2. renders all movements
3. shows weights for each movement
4. shows "Tap to close" hint
5. uses dark background with white text
6. fires onClose when tapped

### 15d: WodSpinner.tsx + GhostPacer.tsx

**Files:**
- Create: `src/components/ui/WodSpinner.tsx`
- Create: `src/components/ui/GhostPacer.tsx`
- Create: `src/components/ui/__tests__/WodSpinner.test.tsx`
- Create: `src/components/ui/__tests__/GhostPacer.test.tsx`

**WodSpinner tests (5 tests):**
1. renders spin button
2. shows generated WOD after spin
3. shows movement list with reps
4. shows reasoning for movement selection
5. shows WOD type badge

**GhostPacer tests (5 tests):**
1. renders "ahead" indicator in green when ahead
2. renders "behind" indicator in red when behind
3. shows formatted time delta
4. shows progress bar
5. shows "No previous attempt" when ghost inactive

---

## Task 16: Page Integration (Batch 6)

**Sequential integration — one file at a time:**

### 16a: WorkoutPage.tsx modifications
- Add PlateCalculator card below movement weights (tap weight → shows plate loadout)
- Add Equipment Checklist card at top of workout view
- Add Warm-Up Generator card (collapsible) before first block
- Add Movement Swap button next to each movement name
- Add Difficulty Prediction badge in header
- Add Whiteboard Mode button in top-right

### 16b: TimerPage.tsx modifications
- Wire Competition Sounds to timer events (countdown, go, round, finish)
- Add Ghost Pacer display during forTime retests
- Add Partner WOD toggle that switches timer to partner mode
- Add Voice Logging "mic" button for weight input during rest periods

### 16c: DashboardPage.tsx modifications
- Add Achievement shelf (horizontal scrollable badges)
- Add Monthly Recap card
- Add WOD Spinner "Spin" button in Quick Actions area

### 16d: LogPage.tsx modifications
- Add Voice Logging mic button next to weight inputs
- Add Score Comparison card after WOD score entry
- Add What-If Calculator link from PR celebration card

### 16e: WodPage.tsx modifications
- Add WOD Spinner section
- Add Score Comparison preview when WOD name matches history

### 16f: HistoryPage.tsx modifications
- Add Yearly Recap card at top
- Add Achievement gallery section

### 16g: SettingsPage.tsx modifications
- Add Sound Pack selector (Competition / Minimal / None)
- Add available equipment checklist (for WOD generator filtering)

### 16h: constants.ts modification
- Add new STORAGE_KEYS: ACHIEVEMENTS, SOUND_PACK, AVAILABLE_EQUIPMENT

---

## Verification

After each batch:
1. `npx tsc --noEmit` — must be clean
2. `npx vitest run` — all tests must pass
3. `npx tsc -b` — must pass (catches unused imports)
4. `npx vite build` — production build must succeed

After all batches:
5. `git push origin main`
6. `npx vercel --prod --yes` — deploy must succeed
7. Browser test via Claude Preview to verify UI rendering
