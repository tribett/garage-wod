import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisMonth, getTotalWodCount } from '@/lib/streak-calculator'
import { getRestDayMessage } from '@/lib/rest-day-guidance'
import { getRecentPRs } from '@/lib/pr-calculator'
import { getWeeklyVolume } from '@/lib/volume-calculator'
import { findNextWorkout } from '@/lib/next-workout'
import { formatShortDate } from '@/lib/date-utils'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Day, DayIntent, WodScoring } from '@/types/program'
import type { PR } from '@/lib/pr-calculator'
import type { WeeklyVolume } from '@/lib/volume-calculator'

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

const INTENT_BADGE: Record<DayIntent, { label: string; variant: 'default' | 'accent' | 'success' | 'warning' | 'muted' }> = {
  heavy: { label: 'Heavy', variant: 'warning' },
  recovery: { label: 'Recovery', variant: 'success' },
  conditioning: { label: 'Conditioning', variant: 'accent' },
  skill: { label: 'Skill', variant: 'default' },
  benchmark: { label: 'Benchmark', variant: 'accent' },
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
  const navigate = useNavigate()

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
            <button
              key={day.dayNumber}
              onClick={() => navigate(`/workout/${weekNumber}/${day.dayNumber}`)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  group-hover:scale-125 group-active:scale-95
                  ${isCompleted
                    ? 'bg-accent dark:bg-accent-dark scale-110'
                    : isCurrent
                      ? 'border-2 border-accent dark:border-accent-dark bg-transparent'
                      : 'bg-zinc-200 dark:bg-zinc-700'
                  }
                `}
              />
              <span
                className={`text-[10px] font-medium transition-colors
                  ${isCurrent
                    ? 'text-accent dark:text-accent-light'
                    : isFuture
                      ? 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-500'
                      : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  }`}
              >
                {day.name.slice(0, 3)}
              </span>
            </button>
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
        <div className="flex items-center gap-1.5">
          {day.intent && (
            <Badge variant={INTENT_BADGE[day.intent].variant}>{INTENT_BADGE[day.intent].label}</Badge>
          )}
          {isCompleted ? (
            <Badge variant="success">Completed</Badge>
          ) : (
            <Badge variant={badgeVariant}>{wodLabel}</Badge>
          )}
        </div>
      </div>

      {/* Block previews — show all blocks (strength, skill, WOD) */}
      {!isCompleted && day.blocks.length > 0 && (
        <div className="mb-4 space-y-3">
          {day.blocks.map((block, blockIdx) => (
            <div key={`${block.type}-${blockIdx}`}>
              {/* Block label */}
              {day.blocks.length > 1 && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  {block.name ?? block.type}
                </p>
              )}
              {block.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{block.description}</p>
              )}
              <div className="space-y-0.5">
                {block.movements.slice(0, 3).map((m) => (
                  <p key={m.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                    {m.reps && <span className="font-semibold">{m.reps}</span>}{' '}
                    {m.name}
                    {m.weight && (
                      <span className="text-zinc-400 dark:text-zinc-500"> ({m.weight})</span>
                    )}
                  </p>
                ))}
                {block.movements.length > 3 && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    +{block.movements.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
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
        <>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/workout/${weekNumber}/${day.dayNumber}`)}
          >
            View Workout
          </Button>

          {/* Next workout preview after completion (Improvement 9) */}
          {nextWorkout && (() => {
            const nextWod = getWodBlock(nextWorkout.day)
            const nextWodLabel = formatWodType(nextWod?.scoring)
            const nextBadgeVariant = wodTypeBadgeVariant(nextWod?.scoring)
            return (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  Up next
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {nextWod?.name ?? nextWorkout.day.name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Week {nextWorkout.weekNumber} · Day {nextWorkout.day.dayNumber}
                    </p>
                  </div>
                  <Badge variant={nextBadgeVariant}>{nextWodLabel}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="mt-2"
                  onClick={() =>
                    navigate(`/workout/${nextWorkout.weekNumber}/${nextWorkout.day.dayNumber}`)
                  }
                >
                  Preview →
                </Button>
              </div>
            )
          })()}
        </>
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

function VolumeChange({ label, thisVal, lastVal }: { label: string; thisVal: number; lastVal: number }) {
  const diff = lastVal > 0 ? Math.round(((thisVal - lastVal) / lastVal) * 100) : thisVal > 0 ? 100 : 0
  const isUp = diff > 0
  const isDown = diff < 0

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-display font-bold text-zinc-900 dark:text-zinc-50">{thisVal}</span>
        {diff !== 0 && (
          <span className={`text-[10px] font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-red-500 dark:text-red-400' : ''}`}>
            {isUp ? '↑' : '↓'}{Math.abs(diff)}%
          </span>
        )}
      </div>
    </div>
  )
}

function WeeklyVolumeCard({ volume }: { volume: WeeklyVolume }) {
  const { thisWeek, lastWeek } = volume
  if (thisWeek.workouts === 0 && lastWeek.workouts === 0) return null

  return (
    <div className="animate-slide-up delay-5">
      <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
        Weekly Volume
      </h3>
      <Card padding="md">
        <div className="space-y-2">
          <VolumeChange label="Workouts" thisVal={thisWeek.workouts} lastVal={lastWeek.workouts} />
          {(thisWeek.totalSets > 0 || lastWeek.totalSets > 0) && (
            <VolumeChange label="Sets" thisVal={thisWeek.totalSets} lastVal={lastWeek.totalSets} />
          )}
          {(thisWeek.totalReps > 0 || lastWeek.totalReps > 0) && (
            <VolumeChange label="Reps" thisVal={thisWeek.totalReps} lastVal={lastWeek.totalReps} />
          )}
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 pt-1">vs. last week</p>
        </div>
      </Card>
    </div>
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
  const weeklyVolume = useMemo(() => getWeeklyVolume(logs), [logs])

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

  const lastWorkoutDate = useMemo(() => {
    const completed = logs.filter((l) => l.completed)
    if (completed.length === 0) return null
    return completed.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0].completedAt
  }, [logs])

  const restDayMessage = useMemo(
    () => getRestDayMessage(streak, lastWorkoutDate),
    [streak, lastWorkoutDate],
  )

  if (!program) {
    return (
      <div className="px-5 py-8">
        <Header title="GRGWOD" />
        <EmptyState
          icon="💪"
          title="Ready to start?"
          description="Load a program in Settings to begin your training."
          action={{
            label: 'Go to Settings',
            onClick: () => navigate('/settings'),
          }}
        />
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

        {/* Rest day guidance */}
        {!currentDay && restDayMessage && (
          <Card padding="sm" className="animate-fade-in delay-3 border-l-4 border-l-emerald-400/50 dark:border-l-emerald-600/50">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {restDayMessage}
            </p>
          </Card>
        )}

        {/* Daily WOD — prominent quick-log card */}
        <Card padding="md" className="animate-slide-up delay-4 bg-accent/[0.03] dark:bg-accent/[0.06] border border-accent/10 dark:border-accent/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Log a WOD
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                CrossFit.com daily WOD or your own
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/wod')}>
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

        {/* Weekly Volume */}
        <WeeklyVolumeCard volume={weeklyVolume} />

        {/* Recent PRs */}
        <RecentPRs prs={recentPRs} unit={settings.weightUnit} />
      </div>
    </div>
  )
}
