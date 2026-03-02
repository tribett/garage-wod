import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === dialogRef.current) onClose()
      }}
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
