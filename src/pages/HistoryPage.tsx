import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSettings } from '@/contexts/SettingsContext'
import { useWorkoutLogs } from '@/contexts/WorkoutLogContext'
import { getAllPRs, getMovementHistory } from '@/lib/pr-calculator'
import { buildPRTimeline } from '@/lib/pr-timeline'
import { estimate1RM, getPercentages } from '@/lib/one-rm-calculator'
import { searchWorkoutHistory } from '@/lib/wod-history'
import { formatDate, formatShortDate } from '@/lib/date-utils'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/EmptyState'
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
  const [searchQuery, setSearchQuery] = useState('')

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

  // Search results
  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchWorkoutHistory(logs, searchQuery) : []),
    [logs, searchQuery],
  )

  const movementHistory = useMemo(
    () => (selectedMovement ? getMovementHistory(selectedMovement, logs) : []),
    [selectedMovement, logs],
  )

  const prTimeline = useMemo(
    () => (selectedMovement ? buildPRTimeline(logs, selectedMovement) : []),
    [selectedMovement, logs],
  )

  if (selectedMovement) {
    const pr = allPRs.get(selectedMovement.toLowerCase())
    return (
      <div className="animate-fade-in">
        {/* Breadcrumb (Improvement 14) */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => {
              setSelectedMovement(null)
              navigate('/history', { replace: true })
            }}
            className="text-accent dark:text-accent-light font-semibold hover:underline"
          >
            History
          </button>
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate">
            {selectedMovement}
          </span>
        </div>
        <Header
          title={selectedMovement}
          subtitle={pr ? `PR: ${pr.value} ${unit} × ${pr.reps}${settings.bodyweight ? ` · ${(pr.value / settings.bodyweight).toFixed(2)}× BW` : ''}` : undefined}
        />
        <div className="px-5 space-y-4">
          <Card>
            <SimpleChart
              data={movementHistory.map((h) => ({ label: h.date, value: h.weight }))}
            />
          </Card>

          {/* PR Progression Chart */}
          {prTimeline.length > 1 && (
            <div>
              <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                PR Progression
              </h3>
              <Card>
                <SimpleChart
                  data={prTimeline.map((e) => ({ label: e.date, value: e.weight }))}
                />
              </Card>
            </div>
          )}

          {/* 1RM Estimate + Percentage Table */}
          {pr && pr.reps > 0 && (() => {
            const oneRM = estimate1RM(pr.value, pr.reps)
            if (oneRM <= 0) return null
            const percentages = getPercentages(oneRM)

            return (
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 px-1 mb-2">
                  Estimated 1RM
                </h3>
                <Card padding="md">
                  <div className="text-center mb-3">
                    <p className="font-display font-extrabold text-2xl text-accent dark:text-accent-light">
                      {oneRM} {unit}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Based on {pr.value} {unit} × {pr.reps} rep{pr.reps !== 1 ? 's' : ''} (Epley)
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                    {percentages.map((p) => (
                      <div key={p.percentage} className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-zinc-400">{p.percentage}%</span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{p.weight}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )
          })()}

          <div className="space-y-2">
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 px-1">
              History
            </h3>
            {movementHistory.length === 0 ? (
              <EmptyState
                icon="📊"
                title="No weight data yet"
                description="Log some sets and your progress will appear here."
              />
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
        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts, movements, scores..."
            className="
              w-full h-10 pl-9 pr-3 rounded-xl text-sm
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <section className="animate-fade-in">
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </h3>
            {searchResults.length === 0 ? (
              <p className="text-sm text-zinc-400 px-1">No matching workouts found.</p>
            ) : (
              <div className="space-y-2">
                {searchResults.slice(0, 20).map((log) => (
                  <Card key={log.id} padding="sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold text-sm">
                          {log.title ?? `Week ${log.weekNumber} · Day ${log.dayNumber}`}
                        </p>
                        <p className="text-xs text-zinc-400">{formatDate(log.completedAt)}</p>
                        {log.description && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                            {log.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {log.wodResult?.score && (
                          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                            {log.wodResult.score}
                          </span>
                        )}
                        {log.wodResult?.scaling && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            log.wodResult.scaling === 'Rx'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {log.wodResult.scaling}
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
        )}

        {/* PRs Section (hidden during search) */}
        {!searchQuery.trim() && allPRs.size > 0 && (
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

        {/* Exercises Section (hidden during search) */}
        {!searchQuery.trim() && movements.length > 0 && (
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

        {/* Recent Workouts (hidden during search) */}
        {!searchQuery.trim() && (
          <section>
            <h3 className="font-display font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2 px-1">
              Recent Workouts
            </h3>
            {completedWorkouts.length === 0 ? (
              <EmptyState
                icon="🏋️"
                title="Your story starts here"
                description="Complete your first workout and it'll show up here."
              />
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
                        {log.wodResult?.scaling && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            log.wodResult.scaling === 'Rx'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {log.wodResult.scaling}
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
        )}
      </div>
    </div>
  )
}
