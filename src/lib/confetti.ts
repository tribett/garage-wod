/**
 * confetti.ts — Generates particles for a celebratory confetti animation.
 *
 * Pure data generation (no DOM) — the React component handles rendering
 * via CSS animations. Each particle has position, color, rotation, scale,
 * and a staggered delay for a natural cascade effect.
 */

export interface ConfettiParticle {
  id: number
  x: number       // 0-100 (percentage across viewport)
  y: number       // starting y (typically above viewport)
  color: string
  rotation: number // degrees
  scale: number    // 0.5 - 1.5
  delay: number    // ms stagger
}

const COLORS = [
  '#f97316', // orange
  '#fbbf24', // amber
  '#34d399', // emerald
  '#60a5fa', // blue
  '#f472b6', // pink
  '#e11d48', // rose (accent)
  '#a78bfa', // violet
]

/**
 * Generate an array of confetti particles for animation.
 * @param count Number of particles (default 30)
 */
export function generateConfettiParticles(count: number = 30): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 20 + 10), // start above viewport
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random(),
    delay: Math.random() * 500,
  }))
}
