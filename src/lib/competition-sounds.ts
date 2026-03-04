/**
 * competition-sounds.ts — Procedural audio feedback using the Web Audio API.
 *
 * Generates tones for workout events (countdowns, horns, celebrations)
 * without any audio files. Supports "competition", "minimal", and "none"
 * sound packs, persisted via localStorage.
 */

export type SoundEvent =
  | 'countdown_tick'
  | 'go_horn'
  | 'round_complete'
  | 'final_ten'
  | 'finish_horn'
  | 'rest_start'
  | 'work_start'
  | 'pr_celebration'

export type SoundPack = 'competition' | 'minimal' | 'none'

interface ToneConfig {
  frequency: number
  duration: number
  type: OscillatorType
}

const STORAGE_KEY = 'gw_sound_pack'

export const SOUND_CONFIGS: Record<
  SoundEvent,
  Record<'competition' | 'minimal', ToneConfig>
> = {
  countdown_tick: {
    competition: { frequency: 800, duration: 100, type: 'sine' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  go_horn: {
    competition: { frequency: 330, duration: 500, type: 'sawtooth' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  round_complete: {
    competition: { frequency: 600, duration: 200, type: 'square' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  final_ten: {
    competition: { frequency: 1000, duration: 150, type: 'sine' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  finish_horn: {
    competition: { frequency: 523, duration: 800, type: 'sawtooth' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  rest_start: {
    competition: { frequency: 300, duration: 300, type: 'sine' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  work_start: {
    competition: { frequency: 700, duration: 300, type: 'square' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
  pr_celebration: {
    competition: { frequency: 880, duration: 600, type: 'sine' },
    minimal: { frequency: 440, duration: 100, type: 'sine' },
  },
}

/**
 * Get the current sound pack from localStorage, defaulting to 'competition'.
 */
export function getSoundPack(): SoundPack {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'competition' || stored === 'minimal' || stored === 'none') {
      return stored
    }
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'competition'
}

/**
 * Persist the chosen sound pack to localStorage.
 */
export function setSoundPack(pack: SoundPack): void {
  try {
    localStorage.setItem(STORAGE_KEY, pack)
  } catch {
    // Silently ignore storage errors
  }
}

/**
 * Generate a procedural tone using the Web Audio API.
 */
export function generateTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
): void {
  try {
    if (typeof AudioContext === 'undefined') return
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    oscillator.frequency.value = frequency
    oscillator.type = type
    oscillator.connect(ctx.destination)
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
    }, duration)
  } catch {
    // Silently ignore — audio is best-effort
  }
}

/**
 * Play a sound for the given event, using the current (or overridden) pack.
 */
export function playSound(event: SoundEvent, pack?: SoundPack): void {
  try {
    const activePack = pack ?? getSoundPack()
    if (activePack === 'none') return

    const config = SOUND_CONFIGS[event][activePack]
    generateTone(config.frequency, config.duration, config.type)
  } catch {
    // Silently ignore — sound is best-effort
  }
}
