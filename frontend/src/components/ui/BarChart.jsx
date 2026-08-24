/**
 * BarChart — pure CSS bar chart for monthly spending.
 * No external library required.
 *
 * Props:
 *   data  — array of { month: string, amount: number }
 *           e.g. [{ month: 'Mar 2026', amount: 1200 }, ...]
 *   title — optional heading shown above the chart
 */

// Format number as compact Indian Rupees — e.g. 12500 → "₹12.5K"
const formatCompact = (amount) => {
  if (amount === 0) return '₹0'
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

// Full format for tooltip — e.g. 12500 → "₹12,500"
const formatFull = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function BarChart({ data = [], title }) {
  if (!data.length) return null

  const maxAmount = Math.max(...data.map((d) => d.amount), 1)
  const hasData   = data.some((d) => d.amount > 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {title && (
        <h3 className="text-base font-semibold text-gray-800 mb-5">{title}</h3>
      )}

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-gray-400">No spending data for this period.</p>
        </div>
      ) : (
        <>
          {/* Bars */}
          <div className="flex items-end justify-between gap-2 h-40">
            {data.map(({ month, amount }) => {
              // Height as % of tallest bar — minimum 4px so zero months are visible
              const heightPct = maxAmount > 0
                ? Math.max((amount / maxAmount) * 100, amount > 0 ? 4 : 0)
                : 0

              const isZero   = amount === 0
              // Shorten label: "Aug 2026" → "Aug"
              const shortLabel = month.split(' ')[0]

              return (
                <div
                  key={month}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${month}: ${formatFull(amount)}`}
                >
                  {/* Amount label — only on non-zero bars */}
                  <span className={`text-xs font-medium transition-opacity ${
                    isZero ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                  } text-indigo-600 whitespace-nowrap`}>
                    {formatCompact(amount)}
                  </span>

                  {/* The bar itself */}
                  <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isZero
                          ? 'bg-gray-100'
                          : 'bg-indigo-500 group-hover:bg-indigo-600'
                      }`}
                      style={{ height: `${heightPct}%`, minHeight: isZero ? '4px' : '6px' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis month labels */}
          <div className="flex justify-between gap-2 mt-2">
            {data.map(({ month }) => (
              <div key={month} className="flex-1 text-center">
                <span className="text-xs text-gray-400 font-medium">
                  {month.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400">Last 6 months</span>
            <span className="text-xs text-gray-500 font-medium">
              Total:{' '}
              {formatFull(data.reduce((sum, d) => sum + d.amount, 0))}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
