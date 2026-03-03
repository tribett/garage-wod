import { describe, test, expect } from 'vitest'
import { generateBackupFilename } from '../backup-filename'

describe('generateBackupFilename', () => {
  test('returns correct format with known date', () => {
    const date = new Date('2026-03-03T14:30:00')
    expect(generateBackupFilename(date)).toBe('grgwod-backup-2026-03-03-1430.json')
  })

  test('pads single-digit months (January = 01)', () => {
    const date = new Date('2026-01-15T10:05:00')
    expect(generateBackupFilename(date)).toBe('grgwod-backup-2026-01-15-1005.json')
  })

  test('pads single-digit days and hours', () => {
    const date = new Date('2026-12-03T05:09:00')
    expect(generateBackupFilename(date)).toBe('grgwod-backup-2026-12-03-0509.json')
  })

  test('midnight (00:00) works correctly', () => {
    const date = new Date('2026-06-15T00:00:00')
    expect(generateBackupFilename(date)).toBe('grgwod-backup-2026-06-15-0000.json')
  })

  test('different dates produce different filenames', () => {
    const dateA = new Date('2026-03-03T14:30:00')
    const dateB = new Date('2026-04-10T09:15:00')
    expect(generateBackupFilename(dateA)).not.toBe(generateBackupFilename(dateB))
  })

  test('always starts with grgwod-backup- and ends with .json', () => {
    const date = new Date('2026-11-25T23:59:00')
    const filename = generateBackupFilename(date)
    expect(filename.startsWith('grgwod-backup-')).toBe(true)
    expect(filename.endsWith('.json')).toBe(true)
  })

  test('default parameter (no arg) still produces valid format', () => {
    const filename = generateBackupFilename()
    expect(filename).toMatch(/^grgwod-backup-\d{4}-\d{2}-\d{2}-\d{4}\.json$/)
  })
})
