import { useRef, useCallback } from 'react'
import { buildResultCard } from '@/lib/result-card'
import type { ResultCardInput } from '@/lib/result-card'

/**
 * ShareResultCard — renders a workout result onto a canvas and provides
 * share / download functionality via the Web Share API or a fallback PNG download.
 */
export function ShareResultCard({
  input,
  onClose,
}: {
  input: ResultCardInput
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const card = buildResultCard(input)

  // Draw the card to canvas on mount
  const drawCard = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return
      canvasRef.current = canvas

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = 600
      const h = card.movements && card.movements.length > 0 ? 440 : 340
      canvas.width = w
      canvas.height = h
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = `${w / dpr}px`
      canvas.style.height = `${h / dpr}px`

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#18181b')
      grad.addColorStop(1, '#09090b')
      ctx.fillStyle = grad
      roundRect(ctx, 0, 0, w, h, 24)
      ctx.fill()

      // Accent bar on left
      ctx.fillStyle = '#f97316'
      roundRect(ctx, 0, 0, 6, h, 3)
      ctx.fill()

      let y = 48

      // Title
      ctx.fillStyle = '#fafafa'
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
      ctx.fillText(card.title, 36, y)
      y += 28

      // Date
      ctx.fillStyle = '#71717a'
      ctx.font = '16px system-ui, -apple-system, sans-serif'
      ctx.fillText(card.date, 36, y)
      y += 48

      // Score (big)
      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
      ctx.fillText(card.score, 36, y)
      y += 20

      // Scaling
      if (card.scaling) {
        y += 8
        ctx.fillStyle = card.scaling === 'Rx' ? '#34d399' : '#a1a1aa'
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
        ctx.fillText(card.scaling, 36, y)
        y += 12
      }

      // PR badge
      if (card.isPR) {
        y += 8
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
        ctx.fillText('🔥 NEW PR', 36, y)
        y += 12
      }

      // Movements
      if (card.movements && card.movements.length > 0) {
        y += 24
        ctx.fillStyle = '#52525b'
        ctx.font = '14px system-ui, -apple-system, sans-serif'
        for (const movement of card.movements) {
          ctx.fillText(movement, 36, y)
          y += 22
        }
      }

      // App branding (bottom right)
      ctx.fillStyle = '#3f3f46'
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(card.appName, w - 24, h - 20)
      ctx.textAlign = 'left'
    },
    [card],
  )

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      )
      if (!blob) return

      const file = new File([blob], 'workout-result.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${card.title} — ${card.score}`,
        })
      } else {
        // Fallback: download
        downloadBlob(blob)
      }
    } catch {
      // User cancelled share, ignore
    }
  }

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    )
    if (blob) downloadBlob(blob)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Canvas preview */}
        <div className="p-4 flex justify-center bg-zinc-100 dark:bg-zinc-950">
          <canvas
            ref={drawCard}
            className="rounded-xl shadow-lg max-w-full"
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleShare}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'workout-result.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
