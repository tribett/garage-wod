import type { Program } from '@/types/program'

/**
 * Serialise a Program to a pretty-printed JSON string suitable for
 * sharing / backup. Returns '' for null/undefined input.
 */
export function exportProgramJSON(program: Program): string {
  if (!program) return ''
  return JSON.stringify(program, null, 2)
}
