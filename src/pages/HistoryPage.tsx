import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSettings } from '@/contexts/SettingsContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { getAllPRs, getMovementHistory } from '@/lib/pr-calculator'
import { formatDate, formatShortDate } from '@/lib/date-utils'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SimpleChart } from '@/components/history/SimpleChart'
import type { PR } from '@/lib/pr-calculator'

export function HistoryPage() {
  const { movementName: urlMovement } = useParams<{ movementName: string }>()
  const navigate = useNavigate()
  const settings = useSettings()
  const logs = useWorkoutLogs()
  const unit = settings.weightUnit
  const [selectedMovement, setSelectedMovement] = useState<string | null>(
    urlMovement ? decodeURIComponent(urlMovement) : null,
  )

  const allPRs = useMemo(() => getAllPRs(logs), [logs])

  // Get all unique movement names that have weight data
  const movements = useMemo(() => {
    const names = new Set<string>()
    for (const log of logs) {
      if (!log.exercises) continue
      for (const ex of log.exercises) {
        if (ex.sets.some((s) => s.weight && s.completed)) {
          names.add(ex.movementName)
        }
      }
    }
    return Array.from(names).sort()
  }, [logs])

  // Get all completed workouts sorted by date
  const completedWorkouts = useMemo(
    () =>
      logs
        .filter((l) => l.completed)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
    [logs],
  )

  const movementHistory = useMemo(
    () => (selectedMovement ? getMovementHistory(selectedMovement, logs) : []),
    [selectedMovement, logs],
  )

  if (selectedMovement) {
    const pr = allPRs.get(selectedMovement.toLowerCase())
    return (
      <div className="animate-fade-in">
        <Header
          title={selectedMovement}
          subtitle={pr ? `PR: ${pr.value} ${unit} × ${pr.reps}` : undefined}
          rightAction={
            <button
              onClick={() => {
                setSelectedMovement(null)
                navigate('/history', { replace: true })
              }}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Back
            </button>
          }
        />
        <div className="px-5 space-y-4">
          <Card>
            <SimpleChart
              data={movementHistory.map((h) => ({ label: h.date, value: h.weight }))}
            />
          </Card>

          <div className="space-y-2">
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 px-1">
              History
            </h3>
            {movementHistory.length === 0 ? (
              <p className="text-sm text-zinc-400 px-1">No logged weights yet.</p>
            ) : (
              [...movementHistory].reverse().map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {formatShortDate(entry.date)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-sm">
                      {entry.weight} {unit}
                    </span>
                    <span className="text-xs text-zinc-400">× {entry.reps}</span>
                    {pr && entry.weight === pr.value && (
                      <Badge variant="accent">PR</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Header title="History" subtitle={`${completedWorkouts.length} workouts logged`} />

      <div className="px-5 space-y-6">
        {/* PRs Section */}
        {allPRs.size > 0 && (
          <section>
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
              Personal Records
            </h3>
            <div className="space-y-2">
              {Array.from(allPRs.values())
                .sort((a, b) => b.value - a.value)
                .map((pr: PR) => (
                  <Card
                    key={pr.movementName}
                    padding="sm"
                    interactive
                    onClick={() => {
                      setSelectedMovement(pr.movementName)
                      navigate(`/history/${encodeURIComponent(pr.movementName)}`, { replace: true })
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold text-sm">{pr.movementName}</p>
                        <p className="text-xs text-zinc-400">{formatShortDate(pr.achievedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-accent dark:text-accent-dark">
                          {pr.value} {unit}
                        </span>
                        <Badge variant="accent">PR</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {/* Exercises Section */}
        {movements.length > 0 && (
          <section>
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
              Exercises
            </h3>
            <div className="space-y-1">
              {movements.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedMovement(name)
                    navigate(`/history/${encodeURIComponent(name)}`, { replace: true })
                  }}
                  className="
                    w-full flex items-center justify-between py-3 px-3 rounded-xl text-left
                    hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors
                  "
                >
                  <span className="text-sm font-medium">{name}</span>
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Workouts */}
        <section>
          <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
            Recent Workouts
          </h3>
          {completedWorkouts.length === 0 ? (
            <p className="text-sm text-zinc-400 px-1">No workouts logged yet. Complete your first workout!</p>
          ) : (
            <div className="space-y-2">
              {completedWorkouts.slice(0, 20).map((log) => (
                <Card key={log.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-sm">
                        {log.title ?? `Week ${log.weekNumber} · Day ${log.dayNumber}`}
                      </p>
                      <p className="text-xs text-zinc-400">{formatDate(log.completedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.wodResult?.score && (
                        <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                          {log.wodResult.score}
                        </span>
                      )}
                      <Badge variant="success">Done</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
