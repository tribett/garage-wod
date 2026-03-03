import { useState, useEffect } from 'react'
import type { WodType } from '@/types/program'

interface WodScoreInputProps {
  wodType: WodType
  value: string
  onChange: (
    score: string,
    structured?: {
      roundsCompleted?: number
      extraReps?: number
      totalTime?: number
    },
  ) => void
  className?: string
}

const inputClass = `
  w-full h-10 px-3 rounded-xl text-sm
  bg-zinc-50 border border-zinc-200 text-zinc-900
  dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-600
  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
`

function parseForTime(value: string): { minutes: number | ''; seconds: number | '' } {
  const match = value.match(/^(\d+):(\d+)$/)
  if (match) {
    return { minutes: Number(match[1]), seconds: Number(match[2]) }
  }
  return { minutes: '', seconds: '' }
}

function parseAmrap(value: string): { rounds: number | ''; reps: number | '' } {
  const match = value.match(/^(\d+)\+(\d+)$/)
  if (match) {
    return { rounds: Number(match[1]), reps: Number(match[2]) }
  }
  return { rounds: '', reps: '' }
}

function parseRounds(value: string): number | '' {
  const match = value.match(/^(\d+)/)
  if (match) {
    return Number(match[1])
  }
  return ''
}

function ForTimeInput({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: WodScoreInputProps['onChange']
  className?: string
}) {
  const parsed = parseForTime(value)
  const [minutes, setMinutes] = useState<number | ''>(parsed.minutes)
  const [seconds, setSeconds] = useState<number | ''>(parsed.seconds)

  useEffect(() => {
    const p = parseForTime(value)
    setMinutes(p.minutes)
    setSeconds(p.seconds)
  }, [value])

  const emitChange = (m: number | '', s: number | '') => {
    const mins = typeof m === 'number' ? m : 0
    const secs = typeof s === 'number' ? s : 0
    const score = `${mins}:${secs < 10 && typeof s === 'number' ? '0' : ''}${secs}`
    const totalTime = (mins * 60 + secs) * 1000
    onChange(score, { totalTime })
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        type="number"
        min={0}
        max={99}
        placeholder="MM"
        value={minutes === '' ? '' : minutes}
        onChange={(e) => {
          const v = e.target.value === '' ? '' : Number(e.target.value)
          setMinutes(v as number | '')
          emitChange(v as number | '', seconds)
        }}
        className={inputClass}
      />
      <span className="text-zinc-400 dark:text-zinc-500 text-lg font-bold select-none">
        :
      </span>
      <input
        type="number"
        min={0}
        max={59}
        placeholder="SS"
        value={seconds === '' ? '' : seconds}
        onChange={(e) => {
          const v = e.target.value === '' ? '' : Number(e.target.value)
          setSeconds(v as number | '')
          emitChange(minutes, v as number | '')
        }}
        className={inputClass}
      />
    </div>
  )
}

function AmrapInput({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: WodScoreInputProps['onChange']
  className?: string
}) {
  const parsed = parseAmrap(value)
  const [rounds, setRounds] = useState<number | ''>(parsed.rounds)
  const [reps, setReps] = useState<number | ''>(parsed.reps)

  useEffect(() => {
    const p = parseAmrap(value)
    setRounds(p.rounds)
    setReps(p.reps)
  }, [value])

  const emitChange = (r: number | '', rep: number | '') => {
    const rVal = typeof r === 'number' ? r : 0
    const repVal = typeof rep === 'number' ? rep : 0
    const score = `${rVal}+${repVal}`
    onChange(score, { roundsCompleted: rVal, extraReps: repVal })
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        type="number"
        min={0}
        placeholder="Rounds"
        value={rounds === '' ? '' : rounds}
        onChange={(e) => {
          const v = e.target.value === '' ? '' : Number(e.target.value)
          setRounds(v as number | '')
          emitChange(v as number | '', reps)
        }}
        className={inputClass}
      />
      <span className="text-zinc-400 dark:text-zinc-500 text-lg font-bold select-none">
        +
      </span>
      <input
        type="number"
        min={0}
        placeholder="Reps"
        value={reps === '' ? '' : reps}
        onChange={(e) => {
          const v = e.target.value === '' ? '' : Number(e.target.value)
          setReps(v as number | '')
          emitChange(rounds, v as number | '')
        }}
        className={inputClass}
      />
    </div>
  )
}

function TextScoreInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: WodScoreInputProps['onChange']
  placeholder: string
  className?: string
}) {
  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  )
}

function RoundsInput({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: WodScoreInputProps['onChange']
  className?: string
}) {
  const parsed = parseRounds(value)
  const [rounds, setRounds] = useState<number | ''>(parsed)

  useEffect(() => {
    setRounds(parseRounds(value))
  }, [value])

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        type="number"
        min={0}
        placeholder="Rounds"
        value={rounds === '' ? '' : rounds}
        onChange={(e) => {
          const v = e.target.value === '' ? '' : Number(e.target.value)
          setRounds(v as number | '')
          if (typeof v === 'number') {
            onChange(`${v} rounds`, { roundsCompleted: v })
          } else {
            onChange('')
          }
        }}
        className={inputClass}
      />
      <span className="text-sm text-zinc-500 dark:text-zinc-400 select-none">
        rounds
      </span>
    </div>
  )
}

export function WodScoreInput({
  wodType,
  value,
  onChange,
  className,
}: WodScoreInputProps) {
  switch (wodType) {
    case 'forTime':
      return <ForTimeInput value={value} onChange={onChange} className={className} />
    case 'amrap':
      return <AmrapInput value={value} onChange={onChange} className={className} />
    case 'emom':
      return (
        <TextScoreInput
          value={value}
          onChange={onChange}
          placeholder="e.g., completed Rx"
          className={className}
        />
      )
    case 'tabata':
      return (
        <TextScoreInput
          value={value}
          onChange={onChange}
          placeholder="e.g., 84 total reps"
          className={className}
        />
      )
    case 'rounds':
      return <RoundsInput value={value} onChange={onChange} className={className} />
  }
}
