// Shown when there are no expenses to display.
// Accepts an optional onAction callback and actionLabel for a CTA button.
export default function EmptyState({
  title = 'No expenses found',
  message = 'Start by adding your first expense.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">💸</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{message}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
