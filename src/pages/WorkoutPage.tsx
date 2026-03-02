import { useParams, useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { BlockType, Day, Movement, WodScoring, WorkoutBlock } from '@/types/program'
import type { TimerConfig, TimerMode } from '@/types/timer'

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

function MovementRow({ movement, showRest }: { movement: Movement; showRest: boolean }) {
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

  return (
    <>
      <div className="py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {descriptor && <span className="font-semibold text-accent dark:text-accent-light mr-1.5">{descriptor}</span>}
            {movement.name}
          </span>
          {movement.weight && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">({movement.weight})</span>
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

function BlockCard({ block }: { block: WorkoutBlock }) {
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

  const weekNumber = Number(params.weekNumber)
  const dayNumber = Number(params.dayNumber)
  const day = findDay(program, weekNumber, dayNumber)

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
        <h1 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
          {day.name}
        </h1>
      </div>

      {/* Blocks */}
      <div className="space-y-4 mb-8">
        {sortedBlocks.map((block, i) => (
          <div key={`${block.type}-${i}`} className={`delay-${Math.min(i + 1, 5)}`}>
            <BlockCard block={block} />
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
            onClick={() => navigate('/timer', { state: { config: timerConfig, weekNumber, dayNumber } })}
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
    </div>
  )
}
