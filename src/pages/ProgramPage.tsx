import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { exportProgramJSON } from '@/lib/program-export'
import { Header } from '@/components/layout/Header'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Day, Phase, WodScoring, Week } from '@/types/program'
import type { WorkoutLog } from '@/types/workout-log'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWodBlock(day: Day) {
  return day.blocks.find((b) => b.type === 'wod') ?? null
}

function formatWodType(scoring: WodScoring | undefined): string {
  if (!scoring) return 'WOD'
  const labels: Record<string, string> = {
    amrap: 'AMRAP',
    emom: 'EMOM',
    forTime: 'For Time',
    tabata: 'Tabata',
    rounds: 'Rounds',
  }
  return labels[scoring.type] ?? 'WOD'
}

function wodTypeBadgeVariant(scoring: WodScoring | undefined) {
  if (!scoring) return 'default' as const
  switch (scoring.type) {
    case 'amrap':
      return 'accent' as const
    case 'emom':
      return 'warning' as const
    case 'forTime':
      return 'success' as const
    default:
      return 'default' as const
  }
}

function isDayCompleted(
  weekNumber: number,
  dayNumber: number,
  logs: WorkoutLog[],
): boolean {
  return logs.some(
    (l) =>
      l.weekNumber === weekNumber &&
      l.dayNumber === dayNumber &&
      l.completed,
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CompletionIcon({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <svg
        className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    )
  }

  return (
    <svg
      className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function DayRow({
  day,
  weekNumber,
  isCurrent,
  isCompleted,
}: {
  day: Day
  weekNumber: number
  isCurrent: boolean
  isCompleted: boolean
}) {
  const navigate = useNavigate()
  const wodBlock = getWodBlock(day)
  const wodLabel = formatWodType(wodBlock?.scoring)
  const badgeVariant = wodTypeBadgeVariant(wodBlock?.scoring)

  return (
    <button
      type="button"
      onClick={() => navigate(`/workout/${weekNumber}/${day.dayNumber}`)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        transition-all duration-150
        ${isCurrent
          ? 'bg-accent-subtle dark:bg-accent-dark-subtle border border-accent/20 dark:border-accent-dark/20'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 active:scale-[0.99]'
        }
      `}
    >
      <CompletionIcon completed={isCompleted} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCurrent
              ? 'text-accent dark:text-accent-light'
              : 'text-zinc-900 dark:text-zinc-50'
          }`}
        >
          {day.name}
        </p>
        {wodBlock && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {wodBlock.name}
          </p>
        )}
      </div>

      <Badge variant={badgeVariant}>{wodLabel}</Badge>

      <svg
        className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  )
}

function WeekSection({
  week,
  currentWeekNumber,
  currentDayNumber,
  logs,
}: {
  week: Week
  currentWeekNumber: number
  currentDayNumber: number
  logs: WorkoutLog[]
}) {
  const isCurrentWeek = week.weekNumber === currentWeekNumber
  const completedCount = week.days.filter((d) =>
    isDayCompleted(week.weekNumber, d.dayNumber, logs),
  ).length

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span
          className={`text-xs font-semibold ${
            isCurrentWeek
              ? 'text-accent dark:text-accent-light'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Week {week.weekNumber}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {completedCount}/{week.days.length}
        </span>
      </div>
      <div className="space-y-1">
        {week.days.map((day) => (
          <DayRow
            key={day.dayNumber}
            day={day}
            weekNumber={week.weekNumber}
            isCurrent={
              isCurrentWeek && day.dayNumber === currentDayNumber
            }
            isCompleted={isDayCompleted(week.weekNumber, day.dayNumber, logs)}
          />
        ))}
      </div>
    </div>
  )
}

function PhaseAccordion({
  phase,
  phaseIndex,
  isCurrentPhase,
  currentWeekNumber,
  currentDayNumber,
  logs,
}: {
  phase: Phase
  phaseIndex: number
  isCurrentPhase: boolean
  currentWeekNumber: number
  currentDayNumber: number
  logs: WorkoutLog[]
}) {
  const completedDays = useMemo(() => {
    let count = 0
    for (const week of phase.weeks) {
      for (const day of week.days) {
        if (isDayCompleted(week.weekNumber, day.dayNumber, logs)) {
          count++
        }
      }
    }
    return count
  }, [phase, logs])

  const totalDays = phase.weeks.reduce((sum, w) => sum + w.days.length, 0)

  return (
    <div className={`animate-slide-up delay-${Math.min(phaseIndex + 1, 5)}`}>
      <Accordion
        title={phase.name}
        defaultOpen={isCurrentPhase}
        badge={
          <Badge variant={isCurrentPhase ? 'accent' : 'muted'}>
            {completedDays}/{totalDays}
          </Badge>
        }
      >
        {phase.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed px-1">
            {phase.description}
          </p>
        )}

        <div className="space-y-2 pb-2">
          {phase.weeks.map((week) => (
            <WeekSection
              key={week.weekNumber}
              week={week}
              currentWeekNumber={currentWeekNumber}
              currentDayNumber={currentDayNumber}
              logs={logs}
            />
          ))}
        </div>
      </Accordion>

      <div className="border-b border-zinc-100 dark:border-zinc-800" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProgramPage
// ---------------------------------------------------------------------------

export function ProgramPage() {
  const navigate = useNavigate()
  const { program, position, currentPhase } = useProgram()
  const logs = useWorkoutLogs()

  if (!program) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No program loaded.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-8">
      <Header
        title="Program"
        subtitle={program.name}
        rightAction={
          <button
            onClick={() => navigate('/program/create')}
            className="text-accent dark:text-accent-light hover:opacity-80 text-sm font-medium transition-opacity"
          >
            + New
          </button>
        }
      />

      <div className="mt-4">
        {program.phases.map((phase, index) => (
          <PhaseAccordion
            key={phase.name}
            phase={phase}
            phaseIndex={index}
            isCurrentPhase={currentPhase?.name === phase.name}
            currentWeekNumber={position.week}
            currentDayNumber={position.day}
            logs={logs}
          />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/program/create')}
        >
          Create New Program
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            const json = exportProgramJSON(program)
            if (!json) return
            const blob = new Blob([json], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${program.name.replace(/\s+/g, '-').toLowerCase()}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          Export Program JSON
        </Button>
      </div>
    </div>
  )
}
