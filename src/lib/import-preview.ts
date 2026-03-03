export interface ImportPreview {
  logCount: number
  programName: string | null
  settingsPresent: boolean
  hasCustomPrograms: boolean
}

/**
 * Parses a backup JSON string and returns a summary without importing.
 * Returns null if the JSON is invalid or not an object.
 */
export function previewImport(jsonString: string): ImportPreview | null {
  try {
    const data = JSON.parse(jsonString)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return null
    }

    const logs = Array.isArray(data.WORKOUT_LOGS) ? data.WORKOUT_LOGS : []
    const customPrograms = Array.isArray(data.CUSTOM_PROGRAMS) ? data.CUSTOM_PROGRAMS : []
    const programName = customPrograms.length > 0 && customPrograms[0]?.name
      ? String(customPrograms[0].name)
      : null

    return {
      logCount: logs.length,
      programName,
      settingsPresent: data.SETTINGS !== undefined,
      hasCustomPrograms: customPrograms.length > 0,
    }
  } catch {
    return null
  }
}
