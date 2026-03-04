import { describe, it, expect } from 'vitest'
import { getEquipmentForDay } from '@/lib/equipment-checklist'
import type { WorkoutBlock } from '@/types/program'

function makeBlock(movementNames: string[]): WorkoutBlock {
  return {
    type: 'wod',
    name: 'Test Block',
    movements: movementNames.map((name, i) => ({
      id: `m${i}`,
      name,
      reps: 10,
    })),
  }
}

describe('getEquipmentForDay', () => {
  it('returns barbell + rack + plates for back squat', () => {
    const blocks = [makeBlock(['back squat'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toContain('barbell')
    expect(result.items).toContain('rack')
    expect(result.items).toContain('plates')
    expect(result.items).toHaveLength(3)
  })

  it('returns pull-up bar for pull-ups', () => {
    const blocks = [makeBlock(['pull-up'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['pull-up bar'])
  })

  it('returns jump rope for double-unders', () => {
    const blocks = [makeBlock(['double-under'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['jump rope'])
  })

  it('returns box for box jumps', () => {
    const blocks = [makeBlock(['box jump'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['box'])
  })

  it('returns kettlebell for KB swings', () => {
    const blocks = [makeBlock(['kettlebell swing'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['kettlebell'])
  })

  it('deduplicates equipment across multiple blocks', () => {
    const blocks = [
      makeBlock(['back squat']),
      makeBlock(['front squat']),
      makeBlock(['deadlift']),
    ]
    const result = getEquipmentForDay(blocks)
    // back squat: barbell, rack, plates
    // front squat: barbell, rack, plates
    // deadlift: barbell, plates
    // deduplicated: barbell, rack, plates
    expect(result.items).toHaveLength(3)
    expect(result.items).toContain('barbell')
    expect(result.items).toContain('rack')
    expect(result.items).toContain('plates')
  })

  it('returns empty list for bodyweight-only workouts', () => {
    const blocks = [makeBlock(['air squat', 'burpee', 'push-up'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual([])
  })

  it('includes dumbbells for DB movements', () => {
    const blocks = [makeBlock(['db snatch', 'db clean'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['dumbbells'])
  })

  it('includes rower for rowing movements', () => {
    const blocks = [makeBlock(['row'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['rower'])
  })

  it('returns rings for ring dips and muscle-ups', () => {
    const blocks = [makeBlock(['ring dip', 'muscle-up'])]
    const result = getEquipmentForDay(blocks)
    expect(result.items).toEqual(['rings'])
  })

  it('handles unknown movement names gracefully', () => {
    const blocks = [makeBlock(['flying kick', 'back squat'])]
    const result = getEquipmentForDay(blocks)
    // unknown movement contributes nothing; back squat contributes barbell, rack, plates
    expect(result.items).toHaveLength(3)
    expect(result.items).toContain('barbell')
    expect(result.items).toContain('rack')
    expect(result.items).toContain('plates')
  })
})
