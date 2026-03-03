import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — catches unhandled errors in the component tree and
 * renders a recovery screen instead of a white page.
 *
 * React class component because there's no hook equivalent of
 * componentDidCatch / getDerivedStateFromError.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = '#/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-50">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              An unexpected error occurred. Your data is safe.
            </p>
            {this.state.error && (
              <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 h-11 rounded-xl text-sm font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 h-11 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
