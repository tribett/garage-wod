import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WodScoreInput } from '../WodScoreInput'

describe('WodScoreInput', () => {
  // ── forTime ─────────────────────────────────────────────────────────
  describe('forTime', () => {
    test('renders two number inputs for minutes and seconds', () => {
      render(<WodScoreInput wodType="forTime" value="" onChange={() => {}} />)

      const minutesInput = screen.getByPlaceholderText('MM')
      const secondsInput = screen.getByPlaceholderText('SS')

      expect(minutesInput).toBeInTheDocument()
      expect(secondsInput).toBeInTheDocument()
      expect(minutesInput).toHaveAttribute('type', 'number')
      expect(secondsInput).toHaveAttribute('type', 'number')
    })

    test('pre-fills from existing value "8:42"', () => {
      render(
        <WodScoreInput wodType="forTime" value="8:42" onChange={() => {}} />,
      )

      const minutesInput = screen.getByPlaceholderText('MM')
      const secondsInput = screen.getByPlaceholderText('SS')

      expect(minutesInput).toHaveValue(8)
      expect(secondsInput).toHaveValue(42)
    })

    test('onChange produces correct score string and structured data', () => {
      const onChange = vi.fn()
      render(
        <WodScoreInput wodType="forTime" value="" onChange={onChange} />,
      )

      const minutesInput = screen.getByPlaceholderText('MM')
      const secondsInput = screen.getByPlaceholderText('SS')

      fireEvent.change(minutesInput, { target: { value: '10' } })
      fireEvent.change(secondsInput, { target: { value: '30' } })

      // The last call should have the final state with both values
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
      expect(lastCall[0]).toBe('10:30')
      expect(lastCall[1]).toEqual({ totalTime: 630000 })
    })
  })

  // ── amrap ───────────────────────────────────────────────────────────
  describe('amrap', () => {
    test('renders rounds and reps inputs with "+" separator', () => {
      render(<WodScoreInput wodType="amrap" value="" onChange={() => {}} />)

      const roundsInput = screen.getByPlaceholderText('Rounds')
      const repsInput = screen.getByPlaceholderText('Reps')

      expect(roundsInput).toBeInTheDocument()
      expect(repsInput).toBeInTheDocument()
      expect(roundsInput).toHaveAttribute('type', 'number')
      expect(repsInput).toHaveAttribute('type', 'number')

      // "+" separator should be visible
      expect(screen.getByText('+')).toBeInTheDocument()
    })

    test('pre-fills from existing value "5+3"', () => {
      render(
        <WodScoreInput wodType="amrap" value="5+3" onChange={() => {}} />,
      )

      const roundsInput = screen.getByPlaceholderText('Rounds')
      const repsInput = screen.getByPlaceholderText('Reps')

      expect(roundsInput).toHaveValue(5)
      expect(repsInput).toHaveValue(3)
    })

    test('onChange produces correct score string and structured data', () => {
      const onChange = vi.fn()
      render(
        <WodScoreInput wodType="amrap" value="" onChange={onChange} />,
      )

      const roundsInput = screen.getByPlaceholderText('Rounds')
      const repsInput = screen.getByPlaceholderText('Reps')

      fireEvent.change(roundsInput, { target: { value: '7' } })
      fireEvent.change(repsInput, { target: { value: '12' } })

      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]
      expect(lastCall[0]).toBe('7+12')
      expect(lastCall[1]).toEqual({ roundsCompleted: 7, extraReps: 12 })
    })
  })

  // ── emom ────────────────────────────────────────────────────────────
  describe('emom', () => {
    test('renders a text input with the correct placeholder', () => {
      render(<WodScoreInput wodType="emom" value="" onChange={() => {}} />)

      const input = screen.getByPlaceholderText('e.g., completed Rx')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  // ── tabata ──────────────────────────────────────────────────────────
  describe('tabata', () => {
    test('renders a text input with the correct placeholder', () => {
      render(<WodScoreInput wodType="tabata" value="" onChange={() => {}} />)

      const input = screen.getByPlaceholderText('e.g., 84 total reps')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  // ── rounds ──────────────────────────────────────────────────────────
  describe('rounds', () => {
    test('renders a single number input and pre-fills from "5 rounds"', () => {
      render(
        <WodScoreInput wodType="rounds" value="5 rounds" onChange={() => {}} />,
      )

      const input = screen.getByPlaceholderText('Rounds')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'number')
      expect(input).toHaveValue(5)
    })

    test('onChange produces correct score string and structured data', () => {
      const onChange = vi.fn()
      render(
        <WodScoreInput wodType="rounds" value="" onChange={onChange} />,
      )

      const input = screen.getByPlaceholderText('Rounds')
      fireEvent.change(input, { target: { value: '8' } })

      expect(onChange).toHaveBeenCalledWith('8 rounds', { roundsCompleted: 8 })
    })
  })
})
