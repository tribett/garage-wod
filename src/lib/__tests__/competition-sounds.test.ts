import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  playSound,
  generateTone,
  getSoundPack,
  setSoundPack,
  SOUND_CONFIGS,
} from '../competition-sounds'
import type { SoundEvent, SoundPack } from '../competition-sounds'

// ---- In-memory localStorage (matches project pattern) ----
let store: Record<string, string> = {}

// ---- Mock AudioContext setup ----
const makeMockOscillator = () => ({
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: { value: 0 },
  type: 'sine' as OscillatorType,
})

let lastOscillator = makeMockOscillator()
let createOscillatorFn: ReturnType<typeof vi.fn>

describe('competition-sounds', () => {
  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { store = {} },
      get length() { return Object.keys(store).length },
      key: (i: number) => Object.keys(store)[i] ?? null,
    })

    createOscillatorFn = vi.fn(() => {
      lastOscillator = makeMockOscillator()
      return lastOscillator
    })

    const mockCtx = {
      createOscillator: createOscillatorFn,
      destination: {},
    }

    vi.stubGlobal('AudioContext', function AudioContext() {
      return mockCtx
    })
  })

  // 1. playSound does not throw when AudioContext is unavailable
  it('playSound does not throw when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined)
    expect(() => playSound('go_horn')).not.toThrow()
  })

  // 2. generateTone creates oscillator with correct frequency
  it('generateTone creates oscillator with correct frequency', () => {
    generateTone(880, 200, 'sine')
    expect(lastOscillator.frequency.value).toBe(880)
  })

  // 3. generateTone stops after specified duration
  it('generateTone stops after specified duration', () => {
    vi.useFakeTimers()
    generateTone(440, 300, 'sine')
    const osc = lastOscillator
    expect(osc.stop).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(osc.stop).toHaveBeenCalled()
    vi.useRealTimers()
  })

  // 4. playSound uses 'competition' pack by default
  it('playSound uses competition pack by default', () => {
    playSound('go_horn')
    expect(lastOscillator.frequency.value).toBe(SOUND_CONFIGS.go_horn.competition.frequency)
  })

  // 5. playSound does nothing when pack is 'none'
  it('playSound does nothing when pack is none', () => {
    setSoundPack('none')
    playSound('go_horn')
    expect(createOscillatorFn).not.toHaveBeenCalled()
  })

  // 6. getSoundPack returns 'competition' when nothing stored
  it('getSoundPack returns competition when nothing stored in localStorage', () => {
    const pack: SoundPack = getSoundPack()
    expect(pack).toBe('competition')
  })

  // 7. setSoundPack persists to localStorage
  it('setSoundPack persists to localStorage', () => {
    setSoundPack('minimal')
    expect(localStorage.getItem('gw_sound_pack')).toBe('minimal')
  })

  // 8. all SoundEvent values are handled without errors
  it('all SoundEvent values are handled without errors', () => {
    const events: SoundEvent[] = [
      'countdown_tick',
      'go_horn',
      'round_complete',
      'final_ten',
      'finish_horn',
      'rest_start',
      'work_start',
      'pr_celebration',
    ]
    for (const event of events) {
      expect(() => playSound(event)).not.toThrow()
    }
  })

  // 9. minimal pack plays simpler tones (frequency differs from competition for go_horn)
  it('minimal pack plays simpler tones', () => {
    setSoundPack('minimal')
    playSound('go_horn')
    expect(lastOscillator.frequency.value).toBe(SOUND_CONFIGS.go_horn.minimal.frequency)
    expect(SOUND_CONFIGS.go_horn.minimal.frequency).not.toBe(SOUND_CONFIGS.go_horn.competition.frequency)
  })

  // 10. SOUND_CONFIGS has entries for all 8 sound events
  it('SOUND_CONFIGS has entries for all 8 sound events', () => {
    const expectedEvents: SoundEvent[] = [
      'countdown_tick',
      'go_horn',
      'round_complete',
      'final_ten',
      'finish_horn',
      'rest_start',
      'work_start',
      'pr_celebration',
    ]
    for (const event of expectedEvents) {
      expect(SOUND_CONFIGS[event]).toBeDefined()
      expect(SOUND_CONFIGS[event].competition).toBeDefined()
      expect(SOUND_CONFIGS[event].minimal).toBeDefined()
      expect(SOUND_CONFIGS[event].competition.frequency).toBeGreaterThan(0)
      expect(SOUND_CONFIGS[event].minimal.frequency).toBeGreaterThan(0)
    }
  })
})
