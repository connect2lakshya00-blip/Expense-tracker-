import { CATEGORY_FILTERS, SORT_OPTIONS } from '../../constants'

/**
 * FilterBar — category filter buttons, sort dropdown, and date range filter.
 *
 * Props:
 *   activeCategory   — currently selected category string (or 'All')
 *   onCategoryChange — called with the new category string
 *   activeSort       — currently selected sort value
 *   onSortChange     — called with the new sort value
 *   dateFrom         — date range start (YYYY-MM-DD string)
 *   dateTo           — date range end (YYYY-MM-DD string)
 *   onDateFromChange — called with new from date
 *   onDateToChange   — called with new to date
 */
export default function FilterBar({
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
}) {
  const hasDateFilter = dateFrom || dateTo

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Category pills + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 flex-shrink-0"
          aria-label="Sort expenses"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Date range filter */}
      {onDateFromChange && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">📅 Date range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="From date"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="To date"
          />
          {hasDateFilter && (
            <button
              onClick={() => { onDateFromChange(''); onDateToChange('') }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  )
}
