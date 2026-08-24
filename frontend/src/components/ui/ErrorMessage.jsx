// Shown when an API request fails.
// Accepts an optional onRetry callback to let the user try again.
export default function ErrorMessage({
  message = 'Unable to load expenses.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-700">Something went wrong</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
