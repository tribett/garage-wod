import { describe, it, expect } from 'vitest'
import {
  getEquipmentAlternatives,
  getInjuryAlternatives,
  EQUIPMENT_REQUIREMENTS,
  INJURY_ALTERNATIVES,
} from '@/lib/movement-swap'
import { categorizeMovement } from '@/lib/movement-frequency'

describe('movement-swap', () => {
  // 1. suggests run/bike/jump rope when rower unavailable for "row"
  it('suggests run/bike/jump rope when rower unavailable for "row"', () => {
    const results = getEquipmentAlternatives('row', 'rower')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('run 200m')
    expect(names).toContain('bike 1:00')
    expect(names).toContain('jump rope 1:00')
  })

  // 2. suggests DB/KB alternatives when no barbell for "back squat"
  it('suggests DB/KB alternatives when no barbell for "back squat"', () => {
    const results = getEquipmentAlternatives('back squat', 'barbell')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('goblet squat')
    expect(names).toContain('DB front squat')
    expect(names).toContain('air squat')
  })

  // 3. suggests ring row when no pull-up bar for "pull-up"
  it('suggests ring row when no pull-up bar for "pull-up"', () => {
    const results = getEquipmentAlternatives('pull-up', 'pull-up bar')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('ring row')
  })

  // 4. returns empty array for unknown movement name
  it('returns empty array for unknown movement name', () => {
    const results = getEquipmentAlternatives('unicorn press', 'barbell')
    expect(results).toEqual([])
  })

  // 5. suggests push-up alternatives for shoulder injury
  it('suggests push-up alternatives for shoulder injury', () => {
    const results = getInjuryAlternatives('push-up', 'shoulder')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('floor press')
    expect(names).toContain('bench press (light)')
  })

  // 6. suggests box squat alternatives for knee injury on "back squat"
  it('suggests box squat alternatives for knee injury on "back squat"', () => {
    const results = getInjuryAlternatives('back squat', 'knee')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('box squat')
    expect(names).toContain('hip hinge')
    expect(names).toContain('deadlift')
  })

  // 7. all alternatives have same movement category as original (or 'other')
  it('all alternatives have same movement category as original (or "other")', () => {
    const results = getEquipmentAlternatives('back squat', 'barbell')
    const originalCategory = categorizeMovement('back squat')
    for (const suggestion of results) {
      expect(
        suggestion.category === originalCategory || suggestion.category === 'other',
      ).toBe(true)
    }
  })

  // 8. provides notes in suggestions
  it('provides notes in suggestions', () => {
    const results = getEquipmentAlternatives('back squat', 'barbell')
    expect(results.length).toBeGreaterThan(0)
    for (const suggestion of results) {
      expect(suggestion.notes).toBeDefined()
      expect(typeof suggestion.notes).toBe('string')
      expect(suggestion.notes!.length).toBeGreaterThan(0)
    }
  })

  // 9. handles case-insensitive movement names ("Back Squat" = "back squat")
  it('handles case-insensitive movement names', () => {
    const lower = getEquipmentAlternatives('back squat', 'barbell')
    const mixed = getEquipmentAlternatives('Back Squat', 'barbell')
    expect(mixed.map((r) => r.alternative)).toEqual(lower.map((r) => r.alternative))
  })

  // 10. suggests bike/ski/jump rope as alternatives for rower
  it('suggests bike/ski/jump rope as alternatives for rower', () => {
    const results = getEquipmentAlternatives('row', 'rower')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('bike 1:00')
    expect(names).toContain('ski erg')
    expect(names).toContain('jump rope 1:00')
  })

  // 11. suggests KB swing for no-barbell deadlift
  it('suggests KB swing for no-barbell deadlift', () => {
    const results = getEquipmentAlternatives('deadlift', 'barbell')
    const names = results.map((r) => r.alternative)
    expect(names).toContain('KB swing')
  })

  // 12. returns multiple options (array length > 1 for common swaps)
  it('returns multiple options for common swaps', () => {
    const equipResults = getEquipmentAlternatives('back squat', 'barbell')
    expect(equipResults.length).toBeGreaterThan(1)

    const injuryResults = getInjuryAlternatives('back squat', 'knee')
    expect(injuryResults.length).toBeGreaterThan(1)
  })

  // 13. equipment alternatives don't require the missing equipment
  it('equipment alternatives do not require the missing equipment', () => {
    const results = getEquipmentAlternatives('back squat', 'barbell')
    const barbellMovements = EQUIPMENT_REQUIREMENTS['barbell'].map((m) => m.toLowerCase())
    for (const suggestion of results) {
      expect(barbellMovements).not.toContain(suggestion.alternative.toLowerCase())
    }
  })

  // 14. injury alternatives avoid stressing the injured body region
  it('injury alternatives avoid stressing the injured body region', () => {
    const results = getInjuryAlternatives('back squat', 'knee')
    // The suggested alternatives should not themselves be in the knee-injury avoid list
    const kneeAvoid = Object.keys(INJURY_ALTERNATIVES['knee']).map((m) => m.toLowerCase())
    for (const suggestion of results) {
      expect(kneeAvoid).not.toContain(suggestion.alternative.toLowerCase())
    }
  })
})
