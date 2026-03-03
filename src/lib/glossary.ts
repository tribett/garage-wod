import { GLOSSARY, type GlossaryEntry } from '@/data/glossary'

/**
 * Pre-compute a lowercase term → definition map for fast lookups.
 */
const lowerMap = new Map(GLOSSARY.map((e) => [e.term.toLowerCase(), e.definition]))

/**
 * Look up the plain-English definition of a CrossFit term.
 * Case-insensitive. Returns null if the term is unknown.
 */
export function getDefinition(term: string): string | null {
  const trimmed = term.trim()
  if (!trimmed) return null
  return lowerMap.get(trimmed.toLowerCase()) ?? null
}

/**
 * Return all glossary entries sorted alphabetically by term.
 * Useful for rendering a full glossary page.
 */
export function getAllTerms(): GlossaryEntry[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
}
