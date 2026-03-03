import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisMonth, getTotalWodCount } from '@/lib/streak-calculator'
import { getRecentPRs } from '@/lib/pr-calculator'
import { findNextWorkout } from '@/lib/next-workout'
import { formatShortDate } from '@/lib/date-utils'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Day, WodScoring } from '@/types/program'
import type { PR } from '@/lib/pr-calculator'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWodBlock(day: Day | null) {
  if (!day) return null
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FlameIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23Z" />
    </svg>
  )
}

function PhaseProgress({
  currentPhase,
  weekNumber,
}: {
  currentPhase: { name: string; weekStart: number; weekEnd: number } | null
  weekNumber: number
}) {
  if (!currentPhase) return null

  const phaseWeeks = currentPhase.weekEnd - currentPhase.weekStart + 1
  const weeksIntoPhase = weekNumber - currentPhase.weekStart + 1

  return (
    <div className="animate-fade-in delay-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Phase Progress
        </span>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Week {weeksIntoPhase} of {phaseWeeks}
        </span>
      </div>
      <ProgressBar value={weeksIntoPhase} max={phaseWeeks} />
    </div>
  )
}

function WeekDots({
  days,
  currentDayNumber,
  weekNumber,
  logs,
}: {
  days: { dayNumber: number; name: string }[]
  currentDayNumber: number
  weekNumber: number
  logs: { weekNumber: number; dayNumber: number; completed: boolean }[]
}) {
  return (
    <div className="animate-fade-in delay-2">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Week {weekNumber}
      </span>
      <div className="flex items-center gap-3 mt-2">
        {days.map((day) => {
          const isCompleted = logs.some(
            (l) =>
              l.weekNumber === weekNumber &&
              l.dayNumber === day.dayNumber &&
              l.completed,
          )
          const isCurrent = day.dayNumber === currentDayNumber
          const isFuture = day.dayNumber > currentDayNumber

          return (
            <div key={day.dayNumber} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${isCompleted
                    ? 'bg-accent dark:bg-accent-dark scale-110'
                    : isCurrent
                      ? 'border-2 border-accent dark:border-accent-dark bg-transparent'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  }
                `}
              />
              <span
                className={`text-[10px] font-medium ${
                  isCurrent
                    ? 'text-accent dark:text-accent-light'
                    : isFuture
                      ? 'text-zinc-400 dark:text-zinc-600'
                      : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {day.name.slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TodayWorkoutCard({
  day,
  weekNumber,
  isCompleted,
  nextWorkout,
}: {
  day: Day | null
  weekNumber: number
  isCompleted: boolean
  nextWorkout: { day: Day; weekNumber: number } | null
}) {
  const navigate = useNavigate()

  if (!day) {
    if (nextWorkout) {
      const nextWod = getWodBlock(nextWorkout.day)
      const nextWodLabel = formatWodType(nextWod?.scoring)
      const nextBadgeVariant = wodTypeBadgeVariant(nextWod?.scoring)

      return (
        <Card padding="lg" className="animate-slide-up delay-3">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Rest day — up next
          </p>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
                {nextWod?.name ?? nextWorkout.day.name}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Week {nextWorkout.weekNumber} · Day {nextWorkout.day.dayNumber}
              </p>
            </div>
            <Badge variant={nextBadgeVariant}>{nextWodLabel}</Badge>
          </div>

          {nextWod && (
            <div className="mb-4 space-y-1">
              {nextWod.movements.slice(0, 3).map((m) => (
                <p key={m.id} className="text-sm text-zinc-600 dark:text-zinc-400">
                  {m.reps && <span className="font-semibold">{m.reps}</span>}{' '}
                  {m.name}
                </p>
              ))}
              {nextWod.movements.length > 3 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  +{nextWod.movements.length - 3} more
                </p>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() =>
              navigate(`/workout/${nextWorkout.weekNumber}/${nextWorkout.day.dayNumber}`)
            }
          >
            Preview Workout
          </Button>
        </Card>
      )
    }

    return (
      <Card padding="lg" className="animate-slide-up delay-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No workout scheduled for today.
        </p>
      </Card>
    )
  }

  const wodBlock = getWodBlock(day)
  const wodLabel = formatWodType(wodBlock?.scoring)
  const badgeVariant = wodTypeBadgeVariant(wodBlock?.scoring)

  return (
    <Card padding="lg" className="animate-slide-up delay-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">
            Today&apos;s Workout
          </p>
          <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
            {wodBlock?.name ?? day.name}
          </h3>
        </div>
        {isCompleted ? (
          <Badge variant="success">Completed</Badge>
        ) : (
          <Badge variant={badgeVariant}>{wodLabel}</Badge>
        )}
      </div>

      {wodBlock?.description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          {wodBlock.description}
        </p>
      )}

      {wodBlock && !isCompleted && (
        <div className="mb-4 space-y-1">
          {wodBlock.movements.slice(0, 4).map((m) => (
            <p key={m.id} className="text-sm text-zinc-700 dark:text-zinc-300">
              {m.reps && <span className="font-semibold">{m.reps}</span>}{' '}
              {m.name}
              {m.weight && (
                <span className="text-zinc-400 dark:text-zinc-500"> ({m.weight})</span>
              )}
            </p>
          ))}
          {wodBlock.movements.length > 4 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              +{wodBlock.movements.length - 4} more
            </p>
          )}
        </div>
      )}

      {!isCompleted ? (
        <Button
          size="lg"
          fullWidth
          onClick={() => navigate(`/workout/${weekNumber}/${day.dayNumber}`)}
        >
          Start Workout
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate(`/workout/${weekNumber}/${day.dayNumber}`)}
        >
          View Workout
        </Button>
      )}
    </Card>
  )
}

function StreakDisplay({ streak }: { streak: number }) {
  if (streak === 0) return null

  return (
    <Card padding="sm" className="animate-slide-up delay-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-subtle dark:bg-accent-dark-subtle">
          <FlameIcon className="w-5 h-5 text-accent dark:text-accent-light" />
        </div>
        <div>
          <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
            {streak} week{streak !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">streak</p>
        </div>
      </div>
    </Card>
  )
}

function WorkoutsThisWeekDisplay({ count }: { count: number }) {
  return (
    <Card padding="sm" className="animate-slide-up delay-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950">
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
            {count}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">this week</p>
        </div>
      </div>
    </Card>
  )
}

function MonthlyDisplay({ count }: { count: number }) {
  return (
    <Card padding="sm" className="animate-slide-up delay-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
            {count}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">this month</p>
        </div>
      </div>
    </Card>
  )
}

function TotalDisplay({ count }: { count: number }) {
  return (
    <Card padding="sm" className="animate-slide-up delay-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950">
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
            {count}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">total WODs</p>
        </div>
      </div>
    </Card>
  )
}

function RecentPRs({ prs, unit }: { prs: PR[]; unit: 'lbs' | 'kg' }) {
  if (prs.length === 0) return null

  return (
    <div className="animate-slide-up delay-5">
      <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
        Recent PRs
      </h3>
      <div className="space-y-2">
        {prs.map((pr) => (
          <Card key={`${pr.movementName}-${pr.achievedAt}`} padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {pr.movementName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatShortDate(pr.achievedAt)}
                </p>
              </div>
              <p className="font-display font-bold text-accent dark:text-accent-light">
                {pr.value} {unit}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const navigate = useNavigate()
  const { program, position, currentPhase, currentWeek, currentDay } =
    useProgram()
  const logs = useWorkoutLogs()
  const settings = useSettings()

  const streak = useMemo(() => calculateStreak(logs), [logs])
  const workoutsThisWeek = useMemo(() => getWorkoutsThisWeek(logs), [logs])
  const workoutsThisMonth = useMemo(() => getWorkoutsThisMonth(logs), [logs])
  const totalWods = useMemo(() => getTotalWodCount(logs), [logs])
  const recentPRs = useMemo(() => getRecentPRs(logs, 3), [logs])

  const isTodayCompleted = useMemo(
    () =>
      logs.some(
        (l) =>
          l.weekNumber === position.week &&
          l.dayNumber === position.day &&
          l.completed,
      ),
    [logs, position.week, position.day],
  )

  const nextWorkout = useMemo(
    () => findNextWorkout(program, position, logs),
    [program, position, logs],
  )

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
        title="GRGWOD"
        subtitle={currentPhase?.name ?? undefined}
      />

      <div className="mt-4 space-y-5">
        {/* Phase progress */}
        <PhaseProgress
          currentPhase={currentPhase}
          weekNumber={position.week}
        />

        {/* Week dots */}
        {currentWeek && (
          <WeekDots
            days={currentWeek.days}
            currentDayNumber={position.day}
            weekNumber={position.week}
            logs={logs}
          />
        )}

        {/* Today's workout */}
        <TodayWorkoutCard
          day={currentDay}
          weekNumber={position.week}
          isCompleted={isTodayCompleted}
          nextWorkout={nextWorkout}
        />

        {/* Daily WOD */}
        <Card padding="md" className="animate-slide-up delay-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Log a WOD
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                CrossFit.com daily WOD or your own
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/wod')}>
              Log WOD
            </Button>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StreakDisplay streak={streak} />
          <WorkoutsThisWeekDisplay count={workoutsThisWeek} />
          <MonthlyDisplay count={workoutsThisMonth} />
          <TotalDisplay count={totalWods} />
        </div>

        {/* Recent PRs */}
        <RecentPRs prs={recentPRs} unit={settings.weightUnit} />
      </div>
    </div>
  )
}
