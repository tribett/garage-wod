import { describe, test, expect } from 'vitest'
import { checkStorageQuota, formatBytes } from '../storage-quota'

describe('formatBytes', () => {
  test('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
  })

  test('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  test('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB')
    expect(formatBytes(5242880)).toBe('5.0 MB')
  })
})

describe('checkStorageQuota', () => {
  test('returns ok when usage is low', () => {
    const result = checkStorageQuota(100000, 5242880) // 100KB of 5MB
    expect(result.level).toBe('ok')
    expect(result.usedBytes).toBe(100000)
    expect(result.totalBytes).toBe(5242880)
    expect(result.percentage).toBeCloseTo(1.9, 0)
  })

  test('returns warning at 70% usage', () => {
    const result = checkStorageQuota(3670016, 5242880) // 70% of 5MB
    expect(result.level).toBe('warning')
  })

  test('returns critical at 90% usage', () => {
    const result = checkStorageQuota(4718592, 5242880) // 90% of 5MB
    expect(result.level).toBe('critical')
  })

  test('percentage is calculated correctly', () => {
    const result = checkStorageQuota(2621440, 5242880) // exactly 50%
    expect(result.percentage).toBe(50)
  })

  test('handles zero total gracefully', () => {
    const result = checkStorageQuota(0, 0)
    expect(result.level).toBe('ok')
    expect(result.percentage).toBe(0)
  })
})
