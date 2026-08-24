import { Component } from 'react'

/**
 * ErrorBoundary — catches unhandled JavaScript errors in any child component.
 *
 * React Error Boundaries MUST be class components — there is no hook equivalent.
 * This wraps the entire app so that if any component crashes during rendering,
 * the user sees a friendly recovery screen instead of a blank white page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Called when any child throws during rendering.
  // Update state so the next render shows the fallback UI.
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // Called after an error has been caught.
  // Good place to log the error to a monitoring service in production.
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReload() {
    window.location.reload()
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">

            {/* Icon */}
            <div className="text-6xl mb-4">💥</div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800">
              Something went wrong
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-500 mt-2 mb-6">
              An unexpected error occurred in the application.
              You can try reloading the page or going back to the dashboard.
            </p>

            {/* Error detail — shown in development */}
            {this.state.error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => this.handleReset()}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reload Page
              </button>
            </div>

          </div>
        </div>
      )
    }

    // No error — render children normally
    return this.props.children
  }
}
