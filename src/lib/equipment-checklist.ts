import type { WorkoutBlock } from '@/types/program'

export type EquipmentItem =
  | 'barbell' | 'dumbbells' | 'kettlebell' | 'pull-up bar' | 'rings'
  | 'box' | 'jump rope' | 'wall ball' | 'slam ball' | 'medicine ball'
  | 'ab mat' | 'rower' | 'bike' | 'ski erg' | 'rope'
  | 'bench' | 'rack' | 'plates' | 'resistance band' | 'ghd'

export interface EquipmentList {
  items: EquipmentItem[]
}

export const EQUIPMENT_MAP: Record<string, EquipmentItem[]> = {
  'back squat': ['barbell', 'rack', 'plates'],
  'front squat': ['barbell', 'rack', 'plates'],
  'overhead squat': ['barbell', 'plates'],
  'deadlift': ['barbell', 'plates'],
  'clean': ['barbell', 'plates'],
  'clean and jerk': ['barbell', 'plates'],
  'snatch': ['barbell', 'plates'],
  'thruster': ['barbell', 'plates'],
  'pull-up': ['pull-up bar'],
  'chest-to-bar pull-up': ['pull-up bar'],
  'toes-to-bar': ['pull-up bar'],
  'muscle-up': ['rings'],
  'ring dip': ['rings'],
  'ring row': ['rings'],
  'box jump': ['box'],
  'step-up': ['box'],
  'box step-up': ['box'],
  'double-under': ['jump rope'],
  'single-under': ['jump rope'],
  'wall ball': ['wall ball'],
  'kettlebell swing': ['kettlebell'],
  'goblet squat': ['kettlebell'],
  'turkish get-up': ['kettlebell'],
  'db snatch': ['dumbbells'],
  'db clean': ['dumbbells'],
  'dumbbell press': ['dumbbells'],
  'dumbbell row': ['dumbbells'],
  'row': ['rower'],
  'rope climb': ['rope'],
  'ghd sit-up': ['ghd'],
  'sit-up': ['ab mat'],
  'bench press': ['barbell', 'bench', 'plates'],
  'bike': ['bike'],
  'assault bike': ['bike'],
  'ski erg': ['ski erg'],
  // bodyweight movements that need no equipment:
  'air squat': [],
  'burpee': [],
  'push-up': [],
  'handstand push-up': [],
  'lunge': [],
  'run': [],
  'plank': [],
}

export function getEquipmentForDay(blocks: WorkoutBlock[]): EquipmentList {
  const equipmentSet = new Set<EquipmentItem>()

  for (const block of blocks) {
    for (const movement of block.movements) {
      const key = movement.name.toLowerCase()
      const equipment = EQUIPMENT_MAP[key]
      if (equipment) {
        for (const item of equipment) {
          equipmentSet.add(item)
        }
      }
    }
  }

  return { items: [...equipmentSet] }
}
