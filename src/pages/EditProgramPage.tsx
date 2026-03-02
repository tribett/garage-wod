import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgramDispatch } from '@/contexts/ProgramContext'
import { buildProgram } from '@/lib/program-builder'
import type { DayTemplate, ProgramTemplate } from '@/lib/program-builder'
import type { WodType } from '@/types/program'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WOD_TYPES: { value: WodType; label: string }[] = [
  { value: 'forTime', label: 'For Time' },
  { value: 'amrap', label: 'AMRAP' },
  { value: 'emom', label: 'EMOM' },
  { value: 'tabata', label: 'Tabata' },
  { value: 'rounds', label: 'Rounds' },
]

const WEEK_OPTIONS = [1, 2, 3, 4, 6, 8, 12]

// ---------------------------------------------------------------------------
// Step 1 — Program Info
// ---------------------------------------------------------------------------

function StepInfo({
  name,
  description,
  weeks,
  onChangeName,
  onChangeDescription,
  onChangeWeeks,
  onNext,
}: {
  name: string
  description: string
  weeks: number
  onChangeName: (v: string) => void
  onChangeDescription: (v: string) => void
  onChangeWeeks: (v: number) => void
  onNext: () => void
}) {
  return (
    <Card padding="lg" className="animate-slide-up">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Program Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g., My 4-Week Program"
            className="
              w-full h-10 px-3 rounded-xl text-sm
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            placeholder="Short description of the program"
            className="
              w-full h-10 px-3 rounded-xl text-sm
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            Number of Weeks
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => onChangeWeeks(w)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                  ${weeks === w
                    ? 'bg-accent text-white dark:bg-accent-dark'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }
                `}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" fullWidth onClick={onNext} disabled={!name.trim()}>
          Next: Add Training Days
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Weekly Template
// ---------------------------------------------------------------------------

function emptyDay(index: number): DayTemplate {
  return {
    name: `Day ${index + 1}`,
    wodType: 'forTime',
    wodName: '',
    movementLines: [],
  }
}

function DayEditor({
  day,
  index,
  onChange,
  onRemove,
}: {
  day: DayTemplate
  index: number
  onChange: (updated: DayTemplate) => void
  onRemove: () => void
}) {
  const [movementText, setMovementText] = useState(day.movementLines.join('\n'))

  const handleMovementBlur = () => {
    onChange({ ...day, movementLines: movementText.split('\n') })
  }

  return (
    <Card padding="md" className="animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-accent dark:text-accent-light uppercase tracking-wide">
            Day {index + 1}
          </span>
          <button
            onClick={onRemove}
            className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>

        {/* Day name */}
        <input
          type="text"
          value={day.name}
          onChange={(e) => onChange({ ...day, name: e.target.value })}
          placeholder="Day name (e.g., Upper Body)"
          className="
            w-full h-9 px-3 rounded-lg text-sm
            bg-zinc-50 border border-zinc-200 text-zinc-900
            dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
          "
        />

        {/* WOD name */}
        <input
          type="text"
          value={day.wodName}
          onChange={(e) => onChange({ ...day, wodName: e.target.value })}
          placeholder="WOD name (e.g., Fran)"
          className="
            w-full h-9 px-3 rounded-lg text-sm
            bg-zinc-50 border border-zinc-200 text-zinc-900
            dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
            placeholder:text-zinc-400 dark:placeholder:text-zinc-600
            focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
          "
        />

        {/* WOD type */}
        <div className="flex flex-wrap gap-1">
          {WOD_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ ...day, wodType: t.value })}
              className={`
                px-2.5 py-1 text-[11px] font-medium rounded-md transition-all
                ${day.wodType === t.value
                  ? 'bg-accent text-white dark:bg-accent-dark'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Movements */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">
            Movements (one per line)
          </label>
          <textarea
            value={movementText}
            onChange={(e) => setMovementText(e.target.value)}
            onBlur={handleMovementBlur}
            placeholder={"21 Thrusters (95/65)\n21 Pull-ups\nRun 400m"}
            rows={4}
            className="
              w-full px-3 py-2 rounded-lg text-sm resize-none font-mono
              bg-zinc-50 border border-zinc-200 text-zinc-900
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
              placeholder:text-zinc-400 dark:placeholder:text-zinc-600
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            "
          />
        </div>
      </div>
    </Card>
  )
}

function StepDays({
  days,
  onChangeDays,
  onBack,
  onNext,
}: {
  days: DayTemplate[]
  onChangeDays: (days: DayTemplate[]) => void
  onBack: () => void
  onNext: () => void
}) {
  const updateDay = (index: number, updated: DayTemplate) => {
    const copy = [...days]
    copy[index] = updated
    onChangeDays(copy)
  }

  const removeDay = (index: number) => {
    onChangeDays(days.filter((_, i) => i !== index))
  }

  const addDay = () => {
    onChangeDays([...days, emptyDay(days.length)])
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 px-1">
        Define the training days that repeat each week.
      </p>

      {days.map((day, i) => (
        <DayEditor
          key={i}
          day={day}
          index={i}
          onChange={(updated) => updateDay(i, updated)}
          onRemove={() => removeDay(i)}
        />
      ))}

      <Button variant="ghost" fullWidth onClick={addDay}>
        + Add Day
      </Button>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button fullWidth onClick={onNext} disabled={days.length === 0}>
          Review Program
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Review & Save
// ---------------------------------------------------------------------------

function StepReview({
  template,
  onBack,
  onSave,
}: {
  template: ProgramTemplate
  onBack: () => void
  onSave: () => void
}) {
  const totalDays = template.daysPerWeek.length * template.weeks

  return (
    <div className="space-y-3 animate-slide-up">
      <Card padding="lg">
        <div className="space-y-3">
          <div>
            <p className="text-lg font-display font-bold text-zinc-900 dark:text-zinc-50">
              {template.name}
            </p>
            {template.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {template.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
              <p className="text-lg font-bold text-accent dark:text-accent-light">
                {template.weeks}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Weeks</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
              <p className="text-lg font-bold text-accent dark:text-accent-light">
                {template.daysPerWeek.length}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Days/Wk</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800">
              <p className="text-lg font-bold text-accent dark:text-accent-light">
                {totalDays}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total</p>
            </div>
          </div>
        </div>
      </Card>

      {template.daysPerWeek.map((day, i) => (
        <Card key={i} padding="md">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {day.name}
              </p>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-light">
                {WOD_TYPES.find((t) => t.value === day.wodType)?.label}
              </span>
            </div>
            {day.wodName && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{day.wodName}</p>
            )}
            {day.movementLines.filter((l) => l.trim()).length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {day.movementLines
                  .filter((l) => l.trim())
                  .map((line, j) => (
                    <p key={j} className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                      {line}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onBack}>
          Edit
        </Button>
        <Button fullWidth onClick={onSave}>
          Create Program
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Success State
// ---------------------------------------------------------------------------

function SuccessState({ name, onNavigate }: { name: string; onNavigate: (path: string) => void }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <Card padding="lg" className="animate-scale-in border-emerald-200 dark:border-emerald-800">
        <div className="text-center space-y-2">
          <div className="text-3xl">🏋️</div>
          <p className="font-display font-bold text-emerald-600 dark:text-emerald-400">
            Program Created!
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {name} is now your active program.
          </p>
        </div>
      </Card>
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={() => onNavigate('/program')}>
          View Program
        </Button>
        <Button fullWidth onClick={() => onNavigate('/')}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EditProgramPage
// ---------------------------------------------------------------------------

type Step = 'info' | 'days' | 'review' | 'success'

export function EditProgramPage() {
  const navigate = useNavigate()
  const dispatch = useProgramDispatch()

  const [step, setStep] = useState<Step>('info')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [weeks, setWeeks] = useState(4)
  const [days, setDays] = useState<DayTemplate[]>([emptyDay(0)])

  const template: ProgramTemplate = {
    name: name.trim(),
    description: description.trim(),
    weeks,
    daysPerWeek: days,
  }

  const handleSave = () => {
    const program = buildProgram(template)
    dispatch({ type: 'LOAD_PROGRAM', payload: program })
    setStep('success')
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Create Program"
        rightAction={
          step !== 'success' ? (
            <button
              onClick={() => navigate(-1)}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm"
            >
              Cancel
            </button>
          ) : undefined
        }
      />

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="px-5 mb-4">
          <div className="flex gap-1.5">
            {(['info', 'days', 'review'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= ['info', 'days', 'review'].indexOf(step)
                    ? 'bg-accent dark:bg-accent-dark'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 text-center">
            Step {['info', 'days', 'review'].indexOf(step) + 1} of 3
          </p>
        </div>
      )}

      <div className="px-5 pb-8">
        {step === 'info' && (
          <StepInfo
            name={name}
            description={description}
            weeks={weeks}
            onChangeName={setName}
            onChangeDescription={setDescription}
            onChangeWeeks={setWeeks}
            onNext={() => setStep('days')}
          />
        )}

        {step === 'days' && (
          <StepDays
            days={days}
            onChangeDays={setDays}
            onBack={() => setStep('info')}
            onNext={() => setStep('review')}
          />
        )}

        {step === 'review' && (
          <StepReview
            template={template}
            onBack={() => setStep('days')}
            onSave={handleSave}
          />
        )}

        {step === 'success' && (
          <SuccessState name={name} onNavigate={(path) => navigate(path)} />
        )}
      </div>
    </div>
  )
}
