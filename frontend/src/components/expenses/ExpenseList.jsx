import ExpenseItem from './ExpenseItem'
import EmptyState from '../ui/EmptyState'
import LoadingState from '../ui/LoadingState'
import ErrorMessage from '../ui/ErrorMessage'

/**
 * Renders the full list of expenses, or the appropriate UI state.
 *
 * Props:
 *   expenses    — array of expense objects
 *   loading     — boolean, true while fetching
 *   error       — error message string, or null
 *   onEdit      — called with expense when Edit is clicked
 *   onDelete    — called with expense when Delete is clicked
 *   onAddFirst  — called when the empty state CTA is clicked
 *   onRetry     — called when the error state retry is clicked
 */
export default function ExpenseList({
  expenses,
  loading,
  error,
  onEdit,
  onDelete,
  onAddFirst,
  onRetry,
}) {
  if (loading) return <LoadingState />

  if (error) return <ErrorMessage message={error} onRetry={onRetry} />

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses found"
        message="No expenses match your current search or filter."
        actionLabel="Add Your First Expense"
        onAction={onAddFirst}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* List header — desktop only */}
      <div className="px-4 md:px-6 py-3 bg-gray-50 border-b border-gray-100 hidden md:flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expense</span>
        <div className="flex items-center gap-24">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category / Date</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</span>
        </div>
      </div>

      {/* Expense rows */}
      <div>
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id || expense._id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs font-semibold text-gray-700">
          Total:{' '}
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(expenses.reduce((sum, e) => sum + e.amount, 0))}
        </span>
      </div>
    </div>
  )
}
