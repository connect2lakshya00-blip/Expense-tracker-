import { CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../../constants'

// Format a date string to a readable format — e.g. "23 Aug 2026"
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Format a number as Indian Rupees — e.g. 1350 → "₹1,350"
const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * One row in the expense list.
 *
 * Props:
 *   expense  — the expense object to display
 *   onEdit   — called with the expense when Edit is clicked
 *   onDelete — called with the expense when Delete is clicked
 */
export default function ExpenseItem({ expense, onEdit, onDelete }) {
  const dotColor = CATEGORY_DOT_COLORS[expense.category] || 'bg-gray-400'
  const badgeColor = CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-700'

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">

      {/* Left: colour dot + title + description */}
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{expense.title}</p>
          {expense.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{expense.description}</p>
          )}
        </div>
      </div>

      {/* Middle: category badge + date */}
      <div className="hidden md:flex flex-col items-center gap-1 mx-6 flex-shrink-0">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColor}`}>
          {expense.category}
        </span>
        <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
      </div>

      {/* Right: amount + action buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-gray-800">
          {formatAmount(expense.amount)}
        </span>

        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit expense"
          aria-label="Edit expense"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(expense)}
          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete expense"
          aria-label="Delete expense"
        >
          🗑️
        </button>
      </div>

    </div>
  )
}
