import { type MovementCategory, categorizeMovement } from '@/lib/movement-frequency'

export type SwapReason = 'equipment' | 'injury' | 'preference'

export interface SwapSuggestion {
  original: string
  alternative: string
  reason: SwapReason
  category: MovementCategory
  notes?: string
}

// Maps equipment to movements that need it
export const EQUIPMENT_REQUIREMENTS: Record<string, string[]> = {
  'rower': ['row', 'rowing'],
  'barbell': [
    'back squat', 'front squat', 'deadlift', 'clean', 'snatch',
    'thruster', 'clean and jerk', 'overhead squat', 'bench press',
  ],
  'pull-up bar': ['pull-up', 'toes-to-bar', 'chest-to-bar pull-up', 'knees-to-elbow'],
  'box': ['box jump', 'step-up', 'box step-up'],
  'rings': ['muscle-up', 'ring dip', 'ring row'],
  'kettlebell': ['kettlebell swing', 'goblet squat', 'turkish get-up'],
  'jump rope': ['double-under', 'single-under'],
  'bike': ['bike', 'assault bike'],
}

// Equipment-based alternatives: missing equipment -> movement -> alternatives
export const EQUIPMENT_ALTERNATIVES: Record<string, Record<string, string[]>> = {
  'rower': {
    'row': ['run 200m', 'bike 1:00', 'jump rope 1:00', 'ski erg'],
  },
  'barbell': {
    'back squat': ['goblet squat', 'DB front squat', 'air squat'],
    'front squat': ['goblet squat', 'DB front squat'],
    'deadlift': ['KB deadlift', 'DB deadlift', 'KB swing'],
    'clean': ['DB clean', 'KB clean'],
    'snatch': ['DB snatch', 'KB snatch'],
    'thruster': ['DB thruster', 'KB goblet thruster'],
    'bench press': ['push-up', 'DB bench press', 'floor press'],
    'overhead squat': ['DB overhead squat', 'goblet squat'],
    'clean and jerk': ['DB clean and press', 'KB clean and press'],
  },
  'pull-up bar': {
    'pull-up': ['ring row', 'bent-over row', 'banded pull-up'],
    'toes-to-bar': ['V-up', 'leg raise', 'sit-up'],
    'chest-to-bar pull-up': ['ring row', 'bent-over row'],
  },
  'box': {
    'box jump': ['broad jump', 'tuck jump', 'lunge jump'],
    'step-up': ['lunge', 'walking lunge'],
  },
  'rings': {
    'muscle-up': ['pull-up + dip', 'burpee pull-up'],
    'ring dip': ['bar dip', 'box dip', 'push-up'],
    'ring row': ['bent-over row', 'DB row'],
  },
}

// Injury-based alternatives: body region -> movements to avoid -> alternatives
export const INJURY_ALTERNATIVES: Record<string, Record<string, string[]>> = {
  'shoulder': {
    'push-up': ['floor press', 'bench press (light)'],
    'overhead press': ['landmine press', 'floor press'],
    'pull-up': ['lat pulldown', 'ring row (low angle)'],
    'snatch': ['DB snatch (light)', 'KB swing'],
    'handstand push-up': ['seated DB press', 'pike push-up'],
    'thruster': ['front squat', 'goblet squat + press'],
  },
  'knee': {
    'back squat': ['box squat', 'hip hinge', 'deadlift'],
    'lunge': ['step-up (low box)', 'hip bridge'],
    'box jump': ['box step-up', 'hip hinge'],
    'pistol': ['box squat', 'hip bridge'],
    'front squat': ['box squat', 'good morning'],
    'air squat': ['box squat (high)', 'hip bridge'],
  },
  'back': {
    'deadlift': ['hip bridge', 'KB swing (light)', 'leg press'],
    'clean': ['DB hang clean (light)', 'front squat'],
    'back squat': ['goblet squat', 'leg press'],
    'snatch': ['DB snatch (light)', 'overhead squat (PVC)'],
    'row': ['bike', 'assault bike'],
  },
  'wrist': {
    'front squat': ['back squat', 'goblet squat'],
    'clean': ['hang clean (straps)', 'DB clean'],
    'push-up': ['fist push-up', 'DB floor press'],
    'handstand push-up': ['seated DB press', 'pike push-up (fists)'],
  },
}

function buildNote(reason: SwapReason, original: string, detail?: string): string {
  if (reason === 'equipment') {
    return `Substitute for ${original} when ${detail ?? 'required equipment'} is unavailable`
  }
  if (reason === 'injury') {
    return `${detail ?? 'Injury'}-friendly alternative for ${original}`
  }
  return `Alternative for ${original}`
}

export function getEquipmentAlternatives(
  movementName: string,
  missingEquipment: string,
): SwapSuggestion[] {
  const normalized = movementName.toLowerCase().trim()
  const equipKey = missingEquipment.toLowerCase().trim()

  const equipmentAlts = EQUIPMENT_ALTERNATIVES[equipKey]
  if (!equipmentAlts) return []

  const alternatives = equipmentAlts[normalized]
  if (!alternatives) return []

  const originalCategory = categorizeMovement(normalized)

  return alternatives.map((alt) => ({
    original: normalized,
    alternative: alt,
    reason: 'equipment' as SwapReason,
    category: categorizeMovement(alt) || originalCategory,
    notes: buildNote('equipment', normalized, missingEquipment),
  }))
}

export function getInjuryAlternatives(
  movementName: string,
  bodyRegion: string,
): SwapSuggestion[] {
  const normalized = movementName.toLowerCase().trim()
  const regionKey = bodyRegion.toLowerCase().trim()

  const regionAlts = INJURY_ALTERNATIVES[regionKey]
  if (!regionAlts) return []

  const alternatives = regionAlts[normalized]
  if (!alternatives) return []

  const originalCategory = categorizeMovement(normalized)

  return alternatives.map((alt) => ({
    original: normalized,
    alternative: alt,
    reason: 'injury' as SwapReason,
    category: categorizeMovement(alt) || originalCategory,
    notes: buildNote('injury', normalized, bodyRegion),
  }))
}

export function getSwaps(
  movementName: string,
  reason: SwapReason,
  detail?: string,
): SwapSuggestion[] {
  const normalized = movementName.toLowerCase().trim()

  if (reason === 'equipment' && detail) {
    return getEquipmentAlternatives(normalized, detail)
  }

  if (reason === 'injury' && detail) {
    return getInjuryAlternatives(normalized, detail)
  }

  // For 'preference' or when no detail, aggregate all possible swaps
  const results: SwapSuggestion[] = []

  // Check all equipment alternatives
  for (const equipKey of Object.keys(EQUIPMENT_ALTERNATIVES)) {
    const alts = getEquipmentAlternatives(normalized, equipKey)
    results.push(...alts)
  }

  // Check all injury alternatives
  for (const regionKey of Object.keys(INJURY_ALTERNATIVES)) {
    const alts = getInjuryAlternatives(normalized, regionKey)
    results.push(...alts)
  }

  return results
}
