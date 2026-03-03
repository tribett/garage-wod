/**
 * Generates a timestamped backup filename for auto-backup downloads.
 * Format: grgwod-backup-YYYY-MM-DD-HHmm.json
 * Example: grgwod-backup-2026-03-03-1430.json
 */
export function generateBackupFilename(now: Date = new Date()): string {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `grgwod-backup-${yyyy}-${mm}-${dd}-${hh}${min}.json`
}
