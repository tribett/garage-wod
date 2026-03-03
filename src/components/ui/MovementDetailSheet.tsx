import { useEffect, useRef, type ReactNode } from 'react'
import { MovementVideo } from './MovementVideo'
import { ScalingChips } from './ScalingChips'

interface MovementDetailSheetProps {
  open: boolean
  onClose: () => void
  movementName: string
  videoId?: string | null
  scalingOptions?: string[] | null
  /** Optional extra content (cues, notes, etc.) below the standard sections */
  children?: ReactNode
}

/**
 * A bottom sheet that slides up to show movement details:
 * video demo, scaling options, and optional coaching cues.
 *
 * Built on <dialog> for accessibility (focus trap, Escape, backdrop click)
 * but styled as a bottom sheet rather than a centered modal.
 */
export function MovementDetailSheet({
  open,
  onClose,
  movementName,
  videoId,
  scalingOptions,
  children,
}: MovementDetailSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    } else {
      dialog.close()
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const hasVideo = !!videoId
  const hasScaling = scalingOptions && scalingOptions.length > 0

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${movementName} details`}
      className="
        backdrop:bg-black/40 backdrop:backdrop-blur-sm
        bg-white dark:bg-zinc-900 rounded-t-2xl shadow-xl
        p-0 m-0 mt-auto max-w-lg w-full
        border-t border-x border-zinc-100 dark:border-zinc-800
        animate-slide-up
        max-h-[85vh] overflow-y-auto
      "
    >
      <div className="p-5">
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
            {movementName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              -mt-1 -mr-1 p-1.5 rounded-lg
              text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              transition-colors
            "
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video */}
        {hasVideo && (
          <div className="mb-4">
            <MovementVideo videoId={videoId} movementName={movementName} />
          </div>
        )}

        {/* Scaling options */}
        {hasScaling && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Scaling Options
            </h3>
            <ScalingChips options={scalingOptions} />
          </div>
        )}

        {/* Optional extra content */}
        {children && <div className="space-y-3">{children}</div>}

        {/* Empty state */}
        {!hasVideo && !hasScaling && !children && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            No additional details available for this movement.
          </p>
        )}
      </div>
    </dialog>
  )
}
