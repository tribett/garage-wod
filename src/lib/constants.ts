export const CURRENT_SCHEMA_VERSION = 1

export const STORAGE_KEYS = {
  META: 'gw_meta',
  SETTINGS: 'gw_settings',
  PROGRAM: 'gw_program',
  WORKOUT_LOGS: 'gw_workout_logs',
  CUSTOM_PROGRAMS: 'gw_custom_programs',
  LAST_TIMER_CONFIG: 'gw_last_timer',
  BODYWEIGHT_LOG: 'gw_bodyweight',
  GOALS: 'gw_goals',
  ACHIEVEMENTS: 'gw_achievements',
  SOUND_PACK: 'gw_sound_pack',
  AVAILABLE_EQUIPMENT: 'gw_available_equipment',
} as const

export const DEFAULT_PROGRAM_ID = 'return-to-crossfit'
export const STANDALONE_PROGRAM_ID = 'standalone'

export const WEIGHT_INCREMENTS = {
  lbs: 5,
  kg: 2.5,
} as const
