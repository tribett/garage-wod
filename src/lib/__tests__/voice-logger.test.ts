import { describe, it, expect, vi } from 'vitest'
import { parseVoiceInput, isVoiceSupported } from '@/lib/voice-logger'

describe('parseVoiceInput', () => {
  it('parses "185 for 5" → weight: 185, reps: 5', () => {
    const result = parseVoiceInput('185 for 5')
    expect(result.weight).toBe(185)
    expect(result.reps).toBe(5)
    expect(result.raw).toBe('185 for 5')
    expect(result.confidence).toBe(1.0)
  })

  it('parses "225 for 3" → weight: 225, reps: 3', () => {
    const result = parseVoiceInput('225 for 3')
    expect(result.weight).toBe(225)
    expect(result.reps).toBe(3)
    expect(result.raw).toBe('225 for 3')
    expect(result.confidence).toBe(1.0)
  })

  it('parses "135 pounds" → weight: 135, reps: null', () => {
    const result = parseVoiceInput('135 pounds')
    expect(result.weight).toBe(135)
    expect(result.reps).toBeNull()
    expect(result.raw).toBe('135 pounds')
    expect(result.confidence).toBe(1.0)
  })

  it('parses "one thirty five" → weight: 135 (word numbers)', () => {
    const result = parseVoiceInput('one thirty five')
    expect(result.weight).toBe(135)
    expect(result.reps).toBeNull()
    expect(result.confidence).toBe(0.8)
  })

  it('parses "two twenty five" → weight: 225 (compound word)', () => {
    const result = parseVoiceInput('two twenty five')
    expect(result.weight).toBe(225)
    expect(result.reps).toBeNull()
    expect(result.confidence).toBe(0.8)
  })

  it('parses "bodyweight" → weight: 0, reps: null', () => {
    const result = parseVoiceInput('bodyweight')
    expect(result.weight).toBe(0)
    expect(result.reps).toBeNull()
    expect(result.raw).toBe('bodyweight')
  })

  it('returns null weight for unparseable input like "hello world"', () => {
    const result = parseVoiceInput('hello world')
    expect(result.weight).toBeNull()
    expect(result.reps).toBeNull()
    expect(result.raw).toBe('hello world')
  })

  it('handles "for" and "x" and "times" as rep delimiters', () => {
    const xResult = parseVoiceInput('185 x 5')
    expect(xResult.weight).toBe(185)
    expect(xResult.reps).toBe(5)

    const timesResult = parseVoiceInput('185 times 5')
    expect(timesResult.weight).toBe(185)
    expect(timesResult.reps).toBe(5)
  })

  it('parses "95 kilos" → weight: 95, reps: null', () => {
    const result = parseVoiceInput('95 kilos')
    expect(result.weight).toBe(95)
    expect(result.reps).toBeNull()
    expect(result.raw).toBe('95 kilos')
  })

  it('trims whitespace and handles mixed case ("  185 FOR 5  " → weight:185, reps:5)', () => {
    const result = parseVoiceInput('  185 FOR 5  ')
    expect(result.weight).toBe(185)
    expect(result.reps).toBe(5)
    expect(result.raw).toBe('  185 FOR 5  ')
  })

  it('parses "three fifteen for two" → weight: 315, reps: 2', () => {
    const result = parseVoiceInput('three fifteen for two')
    expect(result.weight).toBe(315)
    expect(result.reps).toBe(2)
    expect(result.confidence).toBe(0.8)
  })
})

describe('isVoiceSupported', () => {
  it('returns false when SpeechRecognition not on window', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', undefined)
    expect(isVoiceSupported()).toBe(false)
    vi.unstubAllGlobals()
  })
})
