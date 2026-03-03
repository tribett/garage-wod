/**
 * result-card.ts — Pure data builder for shareable workout result cards.
 *
 * Separates the data preparation (testable) from the canvas rendering (visual).
 */

export interface ResultCardInput {
  title: string
  date: string // ISO string
  score: string
  scaling?: string
  movements?: string[]
  isPR?: boolean
}

export interface ResultCardData {
  title: string
  date: string // Formatted display date
  score: string
  scaling?: string
  movements?: string[]
  isPR: boolean
  appName: string
}

/**
 * Formats an ISO date string into a display date: "Jun 15, 2025"
 */
function formatCardDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Build a shareable result card data object from raw inputs.
 */
export function buildResultCard(input: ResultCardInput): ResultCardData {
  return {
    title: input.title,
    date: formatCardDate(input.date),
    score: input.score,
    scaling: input.scaling,
    movements: input.movements,
    isPR: input.isPR ?? false,
    appName: 'GRGWOD',
  }
}
