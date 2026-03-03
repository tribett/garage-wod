import { describe, test, expect } from 'vitest'
import { previewImport } from '../import-preview'

describe('previewImport', () => {
  test('extracts correct data from valid full backup', () => {
    const backup = JSON.stringify({
      WORKOUT_LOGS: [{ id: 'log-1' }, { id: 'log-2' }, { id: 'log-3' }],
      CUSTOM_PROGRAMS: [{ name: 'Garage Strength' }],
      SETTINGS: { unit: 'lbs' },
    })
    const result = previewImport(backup)
    expect(result).toEqual({
      logCount: 3,
      programName: 'Garage Strength',
      settingsPresent: true,
      hasCustomPrograms: true,
    })
  })

  test('returns logCount: 0 when WORKOUT_LOGS is missing', () => {
    const backup = JSON.stringify({ SETTINGS: { unit: 'kg' } })
    const result = previewImport(backup)
    expect(result).not.toBeNull()
    expect(result!.logCount).toBe(0)
  })

  test('returns programName: null when no CUSTOM_PROGRAMS', () => {
    const backup = JSON.stringify({ WORKOUT_LOGS: [{ id: 'log-1' }] })
    const result = previewImport(backup)
    expect(result).not.toBeNull()
    expect(result!.programName).toBeNull()
  })

  test('returns settingsPresent: false when SETTINGS is missing', () => {
    const backup = JSON.stringify({ WORKOUT_LOGS: [] })
    const result = previewImport(backup)
    expect(result).not.toBeNull()
    expect(result!.settingsPresent).toBe(false)
  })

  test('hasCustomPrograms: true when CUSTOM_PROGRAMS has entries', () => {
    const backup = JSON.stringify({
      CUSTOM_PROGRAMS: [{ name: 'My Program' }, { name: 'Another' }],
    })
    const result = previewImport(backup)
    expect(result).not.toBeNull()
    expect(result!.hasCustomPrograms).toBe(true)
  })

  test('returns null for invalid JSON', () => {
    expect(previewImport('not json at all {')).toBeNull()
    expect(previewImport('')).toBeNull()
    expect(previewImport('{broken')).toBeNull()
  })

  test('returns null for non-object data (string, array, number)', () => {
    expect(previewImport('"just a string"')).toBeNull()
    expect(previewImport('[1, 2, 3]')).toBeNull()
    expect(previewImport('42')).toBeNull()
  })

  test('empty object returns all-default preview', () => {
    const result = previewImport('{}')
    expect(result).toEqual({
      logCount: 0,
      programName: null,
      settingsPresent: false,
      hasCustomPrograms: false,
    })
  })

  test('programName extracts name from first custom program', () => {
    const backup = JSON.stringify({
      CUSTOM_PROGRAMS: [
        { name: 'First Program' },
        { name: 'Second Program' },
      ],
    })
    const result = previewImport(backup)
    expect(result).not.toBeNull()
    expect(result!.programName).toBe('First Program')
  })
})
