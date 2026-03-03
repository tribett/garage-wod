/**
 * storage-quota.ts — Monitors localStorage usage and warns when nearing limits.
 *
 * Typical localStorage budget is 5–10 MB per origin. This module provides
 * a simple percentage-based check so the UI can display warnings.
 */

export type QuotaLevel = 'ok' | 'warning' | 'critical'

export interface QuotaStatus {
  level: QuotaLevel
  usedBytes: number
  totalBytes: number
  percentage: number
  usedFormatted: string
  totalFormatted: string
}

const WARNING_THRESHOLD = 70 // percent
const CRITICAL_THRESHOLD = 90

/**
 * Format a byte count into a human-readable string (B / KB / MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/**
 * Check the current storage quota status.
 *
 * @param usedBytes  - current usage from storage.getUsageBytes()
 * @param totalBytes - estimated total capacity (default 5MB)
 */
export function checkStorageQuota(
  usedBytes: number,
  totalBytes: number = 5 * 1024 * 1024,
): QuotaStatus {
  const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0

  let level: QuotaLevel = 'ok'
  if (percentage >= CRITICAL_THRESHOLD) level = 'critical'
  else if (percentage >= WARNING_THRESHOLD) level = 'warning'

  return {
    level,
    usedBytes,
    totalBytes,
    percentage,
    usedFormatted: formatBytes(usedBytes),
    totalFormatted: formatBytes(totalBytes),
  }
}
