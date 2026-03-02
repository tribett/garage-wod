export interface Settings {
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  weightUnit: 'lbs' | 'kg'
  keepScreenAwake: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  soundEnabled: true,
  weightUnit: 'lbs',
  keepScreenAwake: true,
}
