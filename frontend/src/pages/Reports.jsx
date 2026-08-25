import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import LoadingState from '../components/ui/LoadingState'
import ErrorMessage from '../components/ui/ErrorMessage'
import { getStats, getExpenses, getErrorMessage } from '../services/expenseService'
import { CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../constants'

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const formatCompact = (amount) => {
  if (amount === 0) return '₹0'
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${Math.round(amount)}`
}

// Simple donut-style pie using SVG
function PieChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, d) => s + d.amount, 0)
  if (total === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>

  const COLORS = ['#6366f1','#f97316','#3b82f6','#ec4899','#a855f7','#22c55e','#14b8a6','#9ca3af']
  let cumulative = 0
  const size = 160, cx = 80, cy = 80, r = 60, innerR = 36

  const slices = data.map((d, i) => {
    const pct = d.amount / total
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += pct
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const ix1 = cx + innerR * Math.cos(startAngle)
    const iy1 = cy + innerR * Math.sin(startAngle)
    const ix2 = cx + innerR * Math.cos(endAngle)
    const iy2 = cy + innerR * Math.sin(endAngle)
    const largeArc = pct > 0.5 ? 1 : 0
    return {
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`,
      color: COLORS[i % COLORS.length],
      label: d.category,
      pct: Math.round(pct * 100),
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer">
            <title>{s.label}: {s.pct}%</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-xs" fontSize="10" fill="#6b7280">Total</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fill="#111827" fontWeight="600">
          {formatCompact(total)}
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600 truncate">{s.label}</span>
            <span className="text-xs text-gray-400 ml-auto">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Horizontal bar chart for month comparison
function HorizontalBar({ data }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.amount), 1)
  return (
    <div className="space-y-3">
      {data.map(({ month, amount }) => (
        <div key={month} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-14 text-right flex-shrink-0">{month.split(' ')[0]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${Math.max((amount / max) * 100, amount > 0 ? 4 : 0)}%` }}
            >
              {amount > 0 && (
                <span className="text-white text-xs font-medium whitespace-nowrap">
                  {formatCompact(amount)}
                </span>
              )}
            </div>
          </div>
          {amount === 0 && <span className="text-xs text-gray-400">₹0</span>}
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [exportMsg, setExportMsg] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, expensesData] = await Promise.all([
        getStats(),
        getExpenses({ sort: 'newest' }),
      ])
      setStats(statsData)
      setExpenses(expensesData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Filter expenses by date range if set
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date)
    if (dateRange.from && d < new Date(dateRange.from)) return false
    if (dateRange.to && d > new Date(dateRange.to + 'T23:59:59')) return false
    return true
  })

  // Compute stats from filtered list
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0)
  const filteredAvg = filtered.length ? filteredTotal / filtered.length : 0

  // Category breakdown from filtered
  const catMap = {}
  filtered.forEach((e) => {
    if (!catMap[e.category]) catMap[e.category] = { category: e.category, amount: 0, count: 0 }
    catMap[e.category].amount += e.amount
    catMap[e.category].count += 1
  })
  const catBreakdown = Object.values(catMap).sort((a, b) => b.amount - a.amount)

  // Top category
  const topCategory = catBreakdown[0]

  // CSV Export
  const exportCSV = () => {
    const rows = [
      ['Title', 'Amount (₹)', 'Category', 'Date', 'Description'],
      ...filtered.map((e) => [
        `"${e.title}"`,
        e.amount,
        e.category,
        new Date(e.date).toLocaleDateString('en-IN'),
        `"${e.description || ''}"`,
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('CSV exported!')
    setTimeout(() => setExportMsg(''), 3000)
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Reports"
        subtitle="Detailed spending analysis and trends."
        action={
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            ⬇️ Export CSV
          </button>
        }
      />

      <div className="p-4 md:p-8 space-y-5 md:space-y-6">

        {loading && <LoadingState message="Loading reports..." />}
        {error && !loading && <ErrorMessage message={error} onRetry={fetchData} />}

        {exportMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            ✅ {exportMsg}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Date Range Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">📅 Date Range Filter</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">From</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(p => ({ ...p, from: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">To</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(p => ({ ...p, to: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {(dateRange.from || dateRange.to) && (
                  <button
                    onClick={() => setDateRange({ from: '', to: '' })}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear
                  </button>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {filtered.length} expense{filtered.length !== 1 ? 's' : ''} in range
                </span>
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { icon: '💰', label: 'Total Spend', value: formatINR(filteredTotal), sub: `${filtered.length} transactions` },
                { icon: '📊', label: 'Average', value: formatINR(Math.round(filteredAvg)), sub: 'Per expense' },
                { icon: '🏆', label: 'Top Category', value: topCategory?.category || '—', sub: topCategory ? formatINR(topCategory.amount) : 'No data' },
                { icon: '📈', label: 'Categories Used', value: catBreakdown.length, sub: 'out of 8' },
              ].map(({ icon, label, value, sub }) => (
                <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1 truncate">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Monthly Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-5">📉 Monthly Trend (Last 6 Months)</h3>
                {stats?.monthlyTrend?.length ? (
                  <HorizontalBar data={stats.monthlyTrend} />
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No data available</p>
                )}
              </div>

              {/* Pie chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-5">🍩 Spending by Category</h3>
                <PieChart data={catBreakdown} />
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-5">📋 Category Breakdown</h3>
              {catBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No expenses in selected range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expenses</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catBreakdown.map(({ category, amount, count }) => {
                        const share = filteredTotal > 0 ? Math.round((amount / filteredTotal) * 100) : 0
                        const dot = CATEGORY_DOT_COLORS[category] || 'bg-gray-400'
                        const badge = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
                        return (
                          <tr key={category} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>{category}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right text-gray-600">{count}</td>
                            <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatINR(amount)}</td>
                            <td className="py-3 px-3 text-right text-gray-500">{formatINR(Math.round(amount / count))}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-full ${dot} rounded-full`} style={{ width: `${share}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-right">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-3 text-xs font-semibold text-gray-700">Total</td>
                        <td className="py-3 px-3 text-right text-xs font-semibold text-gray-700">{filtered.length}</td>
                        <td className="py-3 px-3 text-right text-xs font-semibold text-gray-800">{formatINR(filteredTotal)}</td>
                        <td className="py-3 px-3 text-right text-xs font-semibold text-gray-500">{formatINR(Math.round(filteredAvg))}</td>
                        <td className="py-3 px-3 text-right text-xs font-semibold text-gray-700">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
