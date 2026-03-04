import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { formatMovementLine } from '@/lib/format-movement'
import { getWeekDays } from '@/lib/get-week-days'
import { getMovementVideoId } from '@/lib/movement-videos'
import { getScalingOptions } from '@/lib/movement-scaling'
import { resolveWeight } from '@/lib/percentage-loader'
import { estimate1RM } from '@/lib/one-rm-calculator'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MovementDetailSheet } from '@/components/ui/MovementDetailSheet'
import type { BlockType, Day, DayIntent, Movement, WodScoring, WorkoutBlock } from '@/types/program'
import type { TimerConfig, TimerMode } from '@/types/timer'

const INTENT_CONFIG: Record<DayIntent, { label: string; variant: 'default' | 'accent' | 'success' | 'warning' | 'muted' }> = {
  heavy: { label: 'Heavy', variant: 'warning' },
  recovery: { label: 'Recovery', variant: 'success' },
  conditioning: { label: 'Conditioning', variant: 'accent' },
  skill: { label: 'Skill', variant: 'default' },
  benchmark: { label: 'Benchmark', variant: 'accent' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findDay(program: ReturnType<typeof useProgram>['program'], weekNumber: number, dayNumber: number): Day | null {
  if (!program) return null
  for (const phase of program.phases) {
    for (const week of phase.weeks) {
      if (week.weekNumber === weekNumber) {
        return week.days.find((d) => d.dayNumber === dayNumber) ?? null
      }
    }
  }
  return null
}

const blockOrder: BlockType[] = ['warmup', 'skill', 'wod', 'cooldown']

function sortBlocks(blocks: WorkoutBlock[]): WorkoutBlock[] {
  return [...blocks].sort(
    (a, b) => blockOrder.indexOf(a.type) - blockOrder.indexOf(b.type),
  )
}

const blockBadgeVariant: Record<BlockType, 'muted' | 'default' | 'accent' | 'warning'> = {
  warmup: 'warning',
  skill: 'default',
  wod: 'accent',
  cooldown: 'muted',
}

function formatScoringLabel(scoring: WodScoring): string {
  switch (scoring.type) {
    case 'amrap':
      return scoring.duration ? `AMRAP ${Math.floor(scoring.duration / 60000)}:00` : 'AMRAP'
    case 'emom':
      return scoring.duration ? `EMOM ${Math.floor(scoring.duration / 60000)}:00` : 'EMOM'
    case 'forTime':
      return scoring.duration ? `For Time (cap ${Math.floor(scoring.duration / 60000)}:00)` : 'For Time'
    case 'tabata':
      return 'Tabata'
    case 'rounds':
      return scoring.rounds ? `${scoring.rounds} Rounds` : 'Rounds'
    default:
      return scoring.type satisfies never
  }
}

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${m} min`
  }
  return `${seconds}s`
}

function scoringToTimerConfig(scoring: WodScoring): TimerConfig {
  switch (scoring.type) {
    case 'amrap':
      return {
        mode: 'amrap',
        totalDuration: scoring.duration ?? 600000,
      }
    case 'emom':
      return {
        mode: 'emom',
        totalDuration: scoring.duration ?? 600000,
        intervalDuration: scoring.interval ?? 60000,
        rounds: scoring.rounds,
      }
    case 'forTime':
      return {
        mode: 'forTime',
        totalDuration: scoring.duration ?? 1200000,
      }
    case 'tabata':
      return {
        mode: 'tabata',
        totalDuration: (scoring.rounds ?? 8) * ((scoring.workInterval ?? 20000) + (scoring.restInterval ?? 10000)),
        rounds: scoring.rounds ?? 8,
        intervalDuration: scoring.workInterval ?? 20000,
        restDuration: scoring.restInterval ?? 10000,
      }
    case 'rounds':
      return {
        mode: 'forTime' as TimerMode,
        totalDuration: scoring.duration ?? 1200000,
        rounds: scoring.rounds,
      }
    default:
      return { mode: 'amrap', totalDuration: 600000 }
  }
}

// ---------------------------------------------------------------------------
// Movement Display
// ---------------------------------------------------------------------------

function MovementRow({ movement, showRest, onTap, resolvedWeight, weightUnit }: { movement: Movement; showRest: boolean; onTap?: () => void; resolvedWeight?: { display: string; calculated: number } | null; weightUnit?: string }) {
  const parts: string[] = []

  // Build the primary descriptor
  if (movement.sets && movement.reps) {
    parts.push(`${movement.sets} x ${movement.reps}`)
  } else if (movement.reps) {
    parts.push(`${movement.reps}`)
  }

  if (movement.distance) {
    parts.push(movement.distance)
  }

  if (movement.duration) {
    parts.push(formatDuration(movement.duration))
  }

  const descriptor = parts.join(' ')
  const hasDetail = !!(getMovementVideoId(movement.name) || getScalingOptions(movement.name))

  return (
    <>
      <div className="py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {descriptor && <span className="font-semibold text-accent dark:text-accent-light mr-1.5">{descriptor}</span>}
            {hasDetail ? (
              <button
                type="button"
                onClick={onTap}
                className="underline decoration-dotted underline-offset-2 hover:text-accent dark:hover:text-accent-light transition-colors"
              >
                {movement.name}
              </button>
            ) : (
              movement.name
            )}
          </span>
          {movement.weight && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">({movement.weight})</span>
          )}
          {resolvedWeight && (
            <span className="ml-1.5 text-xs font-semibold text-accent dark:text-accent-light bg-accent/10 dark:bg-accent/20 px-1.5 py-0.5 rounded-md">
              → {resolvedWeight.display} {weightUnit}
            </span>
          )}
        </div>
        {movement.notes && (
          <p className="text-xs italic text-zinc-500 dark:text-zinc-400 mt-0.5">{movement.notes}</p>
        )}
      </div>

      {showRest && movement.rest != null && movement.rest > 0 && (
        <div className="flex items-center gap-2 py-1.5">
          <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Rest {formatDuration(movement.rest)}
          </span>
          <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Block Display
// ---------------------------------------------------------------------------

function BlockCard({ block, onMovementTap, prMap, roundTo, weightUnit }: { block: WorkoutBlock; onMovementTap: (movement: Movement) => void; prMap: Map<string, { weight: number; reps: number }>; roundTo: number; weightUnit: string }) {
  return (
    <Card padding="md" className="animate-slide-up">
      {/* Block header */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={blockBadgeVariant[block.type]}>{block.type}</Badge>
        <h3 className="text-sm font-display font-bold text-zinc-900 dark:text-zinc-50 truncate">
          {block.name}
        </h3>
      </div>

      {/* Scoring label for WOD blocks */}
      {block.type === 'wod' && block.scoring && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/10 dark:border-accent/20">
          <span className="font-display font-extrabold text-lg text-accent dark:text-accent-light tracking-tight">
            {formatScoringLabel(block.scoring)}
          </span>
        </div>
      )}

      {/* Description */}
      {block.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 leading-relaxed">
          {block.description}
        </p>
      )}

      {/* Movements */}
      <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
        {block.movements.map((movement, i) => (
          <MovementRow
            key={movement.id}
            movement={movement}
            showRest={i < block.movements.length - 1}
            onTap={() => onMovementTap(movement)}
            resolvedWeight={movement.weight ? resolveWeight(movement.weight, movement.name, prMap, estimate1RM, roundTo) : null}
            weightUnit={weightUnit}
          />
        ))}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function WorkoutPage() {
  const params = useParams<{ weekNumber: string; dayNumber: string }>()
  const navigate = useNavigate()
  const { program } = useProgram()
  const logs = useWorkoutLogs()
  const settings = useSettings()
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  const prMap = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number }>()
    for (const log of logs) {
      if (!log.exercises) continue
      for (const ex of log.exercises) {
        const key = ex.movementName.toLowerCase()
        for (const set of ex.sets) {
          if (!set.weight || !set.completed) continue
          const existing = map.get(key)
          if (!existing || set.weight > existing.weight) {
            map.set(key, { weight: set.weight, reps: set.reps ?? 1 })
          }
        }
      }
    }
    return map
  }, [logs])

  const roundTo = settings.weightUnit === 'kg' ? 2.5 : 5

  const weekNumber = Number(params.weekNumber)
  const dayNumber = Number(params.dayNumber)
  const day = findDay(program, weekNumber, dayNumber)
  const weekDays = getWeekDays(program, weekNumber)

  if (!day) {
    return (
      <div className="px-5 pt-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Dashboard
        </button>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Workout not found.</p>
      </div>
    )
  }

  // Find the WOD block (if any) to power the "Start Timer" button
  const wodBlock = day.blocks.find((b) => b.type === 'wod' && b.scoring)
  const timerConfig = wodBlock?.scoring ? scoringToTimerConfig(wodBlock.scoring) : null

  const sortedBlocks = sortBlocks(day.blocks)

  return (
    <div className="px-5 pt-4 pb-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Dashboard
      </button>

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">
          Week {weekNumber} &middot; Day {dayNumber}
        </p>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            {day.name}
          </h1>
          {day.intent && (
            <Badge variant={INTENT_CONFIG[day.intent].variant}>{INTENT_CONFIG[day.intent].label}</Badge>
          )}
        </div>
      </div>

      {/* Day selector — navigate between days in this week */}
      {weekDays.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {weekDays.map((wd) => (
            <button
              key={wd.dayNumber}
              onClick={() => navigate(`/workout/${weekNumber}/${wd.dayNumber}`)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${wd.dayNumber === dayNumber
                  ? 'bg-accent text-white dark:bg-accent-dark'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }
              `}
            >
              D{wd.dayNumber}
              <span className="ml-1 font-normal">{wd.name.length > 12 ? wd.name.slice(0, 12) + '\u2026' : wd.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Coach notes */}
      {day.coachNotes && (
        <Card padding="sm" className="mb-5 border-l-4 border-l-accent/40">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-accent dark:text-accent-light mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {day.coachNotes}
            </p>
          </div>
        </Card>
      )}

      {/* Blocks */}
      <div className="space-y-4 mb-8">
        {sortedBlocks.map((block, i) => (
          <div key={`${block.type}-${i}`} className={`delay-${Math.min(i + 1, 5)}`}>
            <BlockCard block={block} onMovementTap={setSelectedMovement} prMap={prMap} roundTo={roundTo} weightUnit={settings.weightUnit} />
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3">
        {timerConfig && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/timer', {
              state: {
                config: timerConfig,
                weekNumber,
                dayNumber,
                wodName: wodBlock?.name,
                movements: wodBlock?.movements.map(formatMovementLine) ?? [],
              },
            })}
          >
            Start Timer
          </Button>
        )}
        <Button
          variant={timerConfig ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onClick={() => navigate(`/log/${weekNumber}/${dayNumber}`)}
        >
          Log Workout
        </Button>
      </div>

      {/* Movement detail bottom sheet */}
      <MovementDetailSheet
        open={!!selectedMovement}
        onClose={() => setSelectedMovement(null)}
        movementName={selectedMovement?.name ?? ''}
        videoId={selectedMovement ? getMovementVideoId(selectedMovement.name) : null}
        scalingOptions={selectedMovement ? getScalingOptions(selectedMovement.name) : null}
      />
    </div>
  )
}
