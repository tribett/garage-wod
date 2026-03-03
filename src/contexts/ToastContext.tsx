import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  action?: { label: string; onClick: () => void }
  showCountdown?: boolean
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (
    message: string,
    variant?: ToastVariant,
    options?: { action?: Toast['action']; duration?: number; showCountdown?: boolean },
  ) => void
  removeToast: (id: string) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      options?: { action?: Toast['action']; duration?: number; showCountdown?: boolean },
    ) => {
      const id = `toast-${++nextId}`
      const duration = options?.duration ?? 4000
      const toast: Toast = {
        id,
        message,
        variant,
        action: options?.action,
        showCountdown: options?.showCountdown,
        duration,
      }
      setToasts((prev) => [...prev, toast])

      setTimeout(() => removeToast(id), duration)
    },
    [removeToast],
  )

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.some((t) => t.showCountdown) && (
            <style>{`@keyframes toast-countdown { from { width: 100% } to { width: 0% } }`}</style>
          )}
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                pointer-events-auto animate-slide-up relative overflow-hidden
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full
                ${toast.variant === 'success'
                  ? 'bg-emerald-600 text-white'
                  : toast.variant === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-100'
                }
              `}
            >
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick()
                    removeToast(toast.id)
                  }}
                  className="text-sm font-bold underline underline-offset-2 shrink-0 opacity-90 hover:opacity-100"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white/90 shrink-0"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              {toast.showCountdown && toast.duration && (
                <div
                  data-testid="toast-countdown-bar"
                  className="absolute bottom-0 left-0 h-0.5 bg-white/40 rounded-full"
                  style={{
                    animation: `toast-countdown ${toast.duration}ms linear forwards`,
                    width: '100%',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </ToastContext>
  )
}
