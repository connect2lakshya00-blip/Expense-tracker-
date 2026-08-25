import { CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../../constants'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function ExpenseItem({ expense, onEdit, onDelete }) {
  const dotColor = CATEGORY_DOT_COLORS[expense.category] || 'bg-gray-400'
  const badgeColor = CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-700'

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 gap-3">

      {/* Left: dot + title + meta (mobile shows category+date here) */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${dotColor}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{expense.title}</p>
          {expense.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5 hidden sm:block">{expense.description}</p>
          )}
          {/* Mobile: show category + date below title */}
          <div className="flex items-center gap-2 mt-1 md:hidden">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
              {expense.category}
            </span>
            <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
          </div>
        </div>
      </div>

      {/* Middle: category + date — desktop only */}
      <div className="hidden md:flex flex-col items-center gap-1 flex-shrink-0 mx-4">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeColor}`}>
          {expense.category}
        </span>
        <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
      </div>

      {/* Right: amount + actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-gray-800 mr-1">
          {formatAmount(expense.amount)}
        </span>
        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="Edit expense"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(expense)}
          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete expense"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
