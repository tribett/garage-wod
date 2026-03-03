/**
 * haptics.ts — Thin wrapper around navigator.vibrate() for tactile feedback.
 *
 * Provides named haptic patterns for common app events. Falls back silently
 * on devices that don't support the Vibration API.
 */

export type HapticPattern = 'tap' | 'success' | 'warning' | 'celebration'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  celebration: [10, 30, 10, 30, 50],
}

/**
 * Trigger a haptic vibration pattern. No-ops silently if the Vibration API
 * is unavailable (desktop browsers, older iOS, etc.).
 */
export function triggerHaptic(pattern: HapticPattern): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERNS[pattern])
    }
  } catch {
    // Silently ignore — vibration is a best-effort enhancement
  }
}
