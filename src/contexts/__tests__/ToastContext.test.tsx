import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastContext'

// Helper component to trigger toasts via props
function ToastTrigger({
  message,
  variant,
  options,
}: {
  message: string
  variant?: 'success' | 'error' | 'info'
  options?: { action?: { label: string; onClick: () => void }; duration?: number; showCountdown?: boolean }
}) {
  const { addToast } = useToast()
  return <button onClick={() => addToast(message, variant, options)}>Add Toast</button>
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

describe('ToastContext countdown progress bar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('toast with showCountdown renders a progress bar with CSS animation', () => {
    renderWithProvider(
      <ToastTrigger
        message="Countdown toast"
        variant="info"
        options={{ showCountdown: true, duration: 10000 }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    // The toast message should be visible
    expect(screen.getByText('Countdown toast')).toBeInTheDocument()

    // The progress bar should exist with the countdown animation
    const progressBar = document.querySelector('[data-testid="toast-countdown-bar"]')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveStyle({ animation: 'toast-countdown 10000ms linear forwards' })
  })

  test('toast without showCountdown does NOT render a progress bar', () => {
    renderWithProvider(
      <ToastTrigger
        message="No countdown toast"
        variant="success"
        options={{ duration: 5000 }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    // The toast message should be visible
    expect(screen.getByText('No countdown toast')).toBeInTheDocument()

    // No countdown bar should exist
    const progressBar = document.querySelector('[data-testid="toast-countdown-bar"]')
    expect(progressBar).not.toBeInTheDocument()
  })

  test('toast duration is stored on the toast object and used for animation', () => {
    renderWithProvider(
      <ToastTrigger
        message="Duration toast"
        variant="info"
        options={{ showCountdown: true, duration: 7500 }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    const progressBar = document.querySelector('[data-testid="toast-countdown-bar"]')
    expect(progressBar).toBeInTheDocument()
    // The animation duration should match the toast duration
    expect(progressBar).toHaveStyle({ animation: 'toast-countdown 7500ms linear forwards' })
  })

  test('toast action still works alongside countdown', () => {
    const handleAction = vi.fn()

    renderWithProvider(
      <ToastTrigger
        message="Action countdown toast"
        variant="error"
        options={{
          showCountdown: true,
          duration: 8000,
          action: { label: 'Undo', onClick: handleAction },
        }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    // Both the countdown bar and the action button should be present
    const progressBar = document.querySelector('[data-testid="toast-countdown-bar"]')
    expect(progressBar).toBeInTheDocument()

    const actionButton = screen.getByText('Undo')
    expect(actionButton).toBeInTheDocument()

    // Clicking the action should invoke the handler
    act(() => {
      fireEvent.click(actionButton)
    })
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  test('keyframes style tag is injected when countdown toasts exist', () => {
    renderWithProvider(
      <ToastTrigger
        message="Style tag toast"
        variant="info"
        options={{ showCountdown: true, duration: 5000 }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    // The @keyframes style tag should be present in the document
    const styleTags = document.querySelectorAll('style')
    const hasKeyframes = Array.from(styleTags).some((tag) =>
      tag.textContent?.includes('@keyframes toast-countdown'),
    )
    expect(hasKeyframes).toBe(true)
  })

  test('keyframes style tag is NOT injected when no countdown toasts exist', () => {
    renderWithProvider(
      <ToastTrigger
        message="No countdown"
        variant="info"
        options={{ duration: 5000 }}
      />,
    )

    act(() => {
      fireEvent.click(screen.getByText('Add Toast'))
    })

    // No countdown-specific style tag should be injected
    const styleTags = document.querySelectorAll('style')
    const hasKeyframes = Array.from(styleTags).some((tag) =>
      tag.textContent?.includes('@keyframes toast-countdown'),
    )
    expect(hasKeyframes).toBe(false)
  })
})
