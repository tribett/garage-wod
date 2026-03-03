import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      // Remember what was focused before opening
      previousFocusRef.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    } else {
      dialog.close()
      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus()
    }
  }, [open])

  // Trap focus inside the dialog and handle Escape
  useEffect(() => {
    if (!open) return

    const dialog = dialogRef.current
    if (!dialog) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="
        backdrop:bg-black/40 backdrop:backdrop-blur-sm
        bg-white dark:bg-zinc-900 rounded-2xl shadow-xl
        p-0 m-auto max-w-md w-[calc(100%-2rem)]
        animate-scale-in
        border border-zinc-100 dark:border-zinc-800
      "
    >
      <div className="p-5">
        {title && (
          <h2 className="font-display font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
        )}
        {children}
      </div>
    </dialog>
  )
}
