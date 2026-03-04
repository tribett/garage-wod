import { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgram } from '@/contexts/ProgramContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { useSettings } from '@/contexts/SettingsContext'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisMonth, getTotalWodCount } from '@/lib/streak-calculator'
import { getRestDayMessage } from '@/lib/rest-day-guidance'
import { getAverageRPE, getTrainingLoadWarning, RPE_LABELS } from '@/lib/rpe'
import { getRecentPRs } from '@/lib/pr-calculator'
import { getRetestSuggestions } from '@/lib/retest-reminders'
import { getWeeklyVolume } from '@/lib/volume-calculator'
import { findNextWorkout } from '@/lib/next-workout'
import { addEntry, getLatestWeight, getToday } from '@/lib/bodyweight-log'
import type { BodyweightEntry } from '@/lib/bodyweight-log'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { NumberInput } from '@/components/ui/NumberInput'
import { formatShortDate } from '@/lib/date-utils'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TrainingCalendar } from '@/components/ui/TrainingCalendar'
import { GoalCard } from '@/components/ui/GoalCard'
import { Modal } from '@/components/ui/Modal'
import { sortGoals, updateGoalProgress, createGoal } from '@/lib/goals'
import type { Goal, GoalType } from '@/lib/goals'
import type { Day, DayIntent, WodScoring } from '@/types/program'
import type { PR } from '@/lib/pr-calculator'
import type { WeeklyVolume } from '@/lib/volume-calculator'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { checkAchievements, getUnlockedAchievements, saveUnlockedAchievements, ACHIEVEMENTS } from '@/lib/achievements'
import type { AchievementContext } from '@/lib/achievements'
import { RecapCard } from '@/components/ui/RecapCard'
import { getCurrentMonthRecap } from '@/lib/recaps'
import { WodSpinner } from '@/components/ui/WodSpinner'
import { generateWod } from '@/lib/wod-generator'

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

function RPEDisplay({ avgRPE, warning }: { avgRPE: number | null; warning: string | null }) {
  if (avgRPE === null) return null
  const nearestLevel = Math.round(avgRPE) as 1 | 2 | 3 | 4 | 5
  const info = RPE_LABELS[nearestLevel]

  return (
    <Card padding="sm" className="animate-slide-up delay-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950">
          <span className="text-lg">{info?.emoji ?? '😤'}</span>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
            {avgRPE}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">avg effort</p>
        </div>
      </div>
      {warning && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
          ⚠️ {warning}
        </p>
      )}
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

function BodyweightCard({ unit }: { unit: 'lbs' | 'kg' }) {
  const [bwLog, setBwLog] = useState<BodyweightEntry[]>(() =>
    storage.load<BodyweightEntry[]>(STORAGE_KEYS.BODYWEIGHT_LOG, []),
  )
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState<number | undefined>()

  const todayWeight = useMemo(() => getToday(bwLog), [bwLog])
  const latestWeight = useMemo(() => getLatestWeight(bwLog), [bwLog])

  const handleSave = useCallback(() => {
    if (inputValue == null || inputValue <= 0) return
    const today = new Date().toISOString().slice(0, 10)
    const updated = addEntry(bwLog, { date: today, weight: inputValue })
    setBwLog(updated)
    storage.save(STORAGE_KEYS.BODYWEIGHT_LOG, updated)
    setEditing(false)
    setInputValue(undefined)
  }, [inputValue, bwLog])

  const displayWeight = todayWeight ?? latestWeight
  const step = unit === 'lbs' ? 1 : 0.5

  return (
    <Card padding="sm" className="animate-slide-up delay-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950">
          <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
          </svg>
        </div>
        {editing ? (
          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1">
              <NumberInput
                value={inputValue}
                onChange={setInputValue}
                step={step}
                min={50}
                placeholder={displayWeight ? String(displayWeight) : '175'}
                unit={unit}
              />
            </div>
            <button
              onClick={handleSave}
              className="text-xs font-semibold text-accent dark:text-accent-light px-2 py-1"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setInputValue(undefined) }}
              className="text-xs text-zinc-400 px-1 py-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="flex-1 flex items-center justify-between"
            onClick={() => setEditing(true)}
          >
            <div>
              <p className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-tight text-left">
                {displayWeight ? `${displayWeight} ${unit}` : '—'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-left">
                {todayWeight ? 'today' : displayWeight ? 'last logged' : 'tap to log'}
              </p>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">BW</span>
          </button>
        )}
      </div>
    </Card>
  )
}

function RetestCard({ suggestions, onRetest }: {
  suggestions: { wodName: string; lastScore: string; daysSince: number }[]
  onRetest: (wodName: string) => void
}) {
  if (suggestions.length === 0) return null

  return (
    <div className="animate-slide-up delay-5">
      <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
        Time to Retest?
      </h3>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <Card key={s.wodName} padding="sm">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => onRetest(s.wodName)}
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {s.wodName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.lastScore && `Last: ${s.lastScore} · `}{s.daysSince}d ago
                </p>
              </div>
              <span className="text-xs font-semibold text-accent dark:text-accent-light">
                Retest →
              </span>
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AddGoalModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (goal: Goal) => void }) {
  const [type, setType] = useState<GoalType>('weight')
  const [movementName, setMovementName] = useState('')
  const [targetValue, setTargetValue] = useState<number | undefined>()
  const [unit, setUnit] = useState('lbs')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = () => {
    if (!movementName.trim() || !targetValue) return
    const goal = createGoal({
      type,
      movementName: movementName.trim(),
      targetValue,
      unit,
      deadline: deadline || undefined,
    })
    onSave(goal)
    setMovementName('')
    setTargetValue(undefined)
    setDeadline('')
  }

  return (
    <Modal open={open} onClose={onClose} title="New Goal">
      <div className="space-y-3">
        {/* Type selector */}
        <div className="flex gap-2">
          {(['weight', 'time', 'skill'] as GoalType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t)
                setUnit(t === 'weight' ? 'lbs' : t === 'time' ? 'sec' : 'reps')
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                type === t
                  ? 'bg-accent text-white'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {t === 'weight' ? '🏋️ Weight' : t === 'time' ? '⏱️ Time' : '💪 Skill'}
            </button>
          ))}
        </div>

        {/* Movement name */}
        <input
          type="text"
          value={movementName}
          onChange={(e) => setMovementName(e.target.value)}
          placeholder="Movement name (e.g., Back Squat)"
          className="w-full h-10 px-3 rounded-xl text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        {/* Target */}
        <div className="flex gap-2">
          <input
            type="number"
            value={targetValue ?? ''}
            onChange={(e) => setTargetValue(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Target"
            className="flex-1 h-10 px-3 rounded-xl text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <span className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 px-2">{unit}</span>
        </div>

        {/* Deadline */}
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full h-10 px-3 rounded-xl text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        <Button variant="primary" fullWidth onClick={handleSubmit} disabled={!movementName.trim() || !targetValue}>
          Create Goal
        </Button>
      </div>
    </Modal>
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

  const avgRPE = useMemo(() => {
    const thisWeekLogs = logs.filter((l) => l.completed && l.rpe != null)
    return getAverageRPE(thisWeekLogs)
  }, [logs])

  const trainingLoadWarning = useMemo(() => {
    const recentRPEs = logs
      .filter((l) => l.completed && l.rpe != null)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
      .map((l) => l.rpe!)
    return getTrainingLoadWarning(recentRPEs)
  }, [logs])

  const retestSuggestions = useMemo(() => getRetestSuggestions(logs), [logs])

  const restDayMessage = useMemo(
    () => getRestDayMessage(streak, lastWorkoutDate),
    [streak, lastWorkoutDate],
  )

  // Goals
  const [goals, setGoals] = useState<Goal[]>(() =>
    storage.load<Goal[]>(STORAGE_KEYS.GOALS, []),
  )
  const [showAddGoal, setShowAddGoal] = useState(false)

  const prMap = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number }>()
    for (const log of logs) {
      if (!log.exercises) continue
      for (const ex of log.exercises) {
        for (const set of ex.sets) {
          if (!set.weight || !set.completed) continue
          const key = ex.movementName.toLowerCase()
          const existing = map.get(key)
          if (!existing || set.weight > existing.weight) {
            map.set(key, { weight: set.weight, reps: set.reps ?? 1 })
          }
        }
      }
    }
    return map
  }, [logs])

  const activeGoals = useMemo(() => {
    const updated = goals.map((g) => updateGoalProgress(g, prMap))
    return sortGoals(updated).filter((g) => !g.completedAt).slice(0, 3)
  }, [goals, prMap])

  const handleAddGoal = useCallback((goal: Goal) => {
    const updated = [...goals, goal]
    setGoals(updated)
    storage.save(STORAGE_KEYS.GOALS, updated)
    setShowAddGoal(false)
  }, [goals])

  const handleDeleteGoal = useCallback((id: string) => {
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    storage.save(STORAGE_KEYS.GOALS, updated)
  }, [goals])

  // Achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => getUnlockedAchievements())

  useEffect(() => {
    const achievementPrs = new Map<string, { value: number; reps: number }>()
    prMap.forEach((v, k) => achievementPrs.set(k, { value: v.weight, reps: v.reps }))
    const ctx: AchievementContext = {
      logs,
      prs: achievementPrs,
      bodyweight: undefined,
      streakWeeks: streak,
    }
    const alreadyIds = unlockedAchievements.map(a => a.id)
    const newlyUnlocked = checkAchievements(ctx, alreadyIds)
    if (newlyUnlocked.length > 0) {
      const updated = [...unlockedAchievements, ...newlyUnlocked]
      setUnlockedAchievements(updated)
      saveUnlockedAchievements(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs])

  // Monthly recap
  const monthlyRecap = useMemo(() => getCurrentMonthRecap(logs), [logs])
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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

        {/* WOD Spinner */}
        <div className="mt-4">
          <WodSpinner onGenerate={() => generateWod(logs)} />
        </div>

        {/* Bodyweight quick-log */}
        <BodyweightCard unit={settings.weightUnit} />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StreakDisplay streak={streak} />
          <WorkoutsThisWeekDisplay count={workoutsThisWeek} />
          <MonthlyDisplay count={workoutsThisMonth} />
          <TotalDisplay count={totalWods} />
        </div>

        {/* Achievements */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">🏆 Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {ACHIEVEMENTS.slice(0, 8).map(def => {
              const unlocked = unlockedAchievements.find(a => a.id === def.id)
              return (
                <div key={def.id} className="flex-shrink-0">
                  <AchievementBadge
                    name={def.name}
                    icon={def.icon}
                    tier={def.tier}
                    description={def.description}
                    unlockedAt={unlocked?.unlockedAt}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Monthly Recap */}
        <div className="mt-6">
          <RecapCard
            month={`${monthNames[monthlyRecap.month]} ${monthlyRecap.year}`}
            totalWorkouts={monthlyRecap.totalWorkouts}
            prsHit={monthlyRecap.prsHit}
            topMovement={monthlyRecap.topMovement}
            comparedToLastMonth={monthlyRecap.comparedToLastMonth ? { workoutDelta: monthlyRecap.comparedToLastMonth.workoutDelta } : undefined}
          />
        </div>

        {/* Training Calendar */}
        {logs.length > 0 && <TrainingCalendar logs={logs} />}

        {/* Goals */}
        {(activeGoals.length > 0 || goals.length === 0) && (
          <div className="animate-slide-up delay-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                Goals
              </h3>
              <button
                onClick={() => setShowAddGoal(true)}
                className="text-xs font-semibold text-accent dark:text-accent-light hover:underline"
              >
                + Add
              </button>
            </div>
            {activeGoals.length > 0 ? (
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
                ))}
              </div>
            ) : (
              <Card padding="sm">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">
                  Set a goal to track your progress
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Training Load (RPE) */}
        <RPEDisplay avgRPE={avgRPE} warning={trainingLoadWarning} />

        {/* Weekly Volume */}
        <WeeklyVolumeCard volume={weeklyVolume} />

        {/* Retest Suggestions */}
        <RetestCard
          suggestions={retestSuggestions}
          onRetest={(wodName) => navigate('/wod', { state: { prefillTitle: wodName } })}
        />

        {/* Recent PRs */}
        <RecentPRs prs={recentPRs} unit={settings.weightUnit} />
      </div>

      <AddGoalModal
        open={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={handleAddGoal}
      />
    </div>
  )
}
