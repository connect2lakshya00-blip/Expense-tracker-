import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import SummaryCard from '../components/ui/SummaryCard'
import BarChart from '../components/ui/BarChart'
import LoadingState from '../components/ui/LoadingState'
import ErrorMessage from '../components/ui/ErrorMessage'
import { CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../constants'
import { getStats, getExpenses, getErrorMessage } from '../services/expenseService'

// ── Formatters ──────────────────────────────────────────────────────────────

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ── Default empty stats shape ───────────────────────────────────────────────
const EMPTY_STATS = {
  summary: {
    totalAmount: 0, totalCount: 0, averageAmount: 0,
    currentMonthAmount: 0, currentMonthCount: 0,
  },
  categoryBreakdown: [],
  monthlyTrend: [],
}

// ── Component ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState(EMPTY_STATS)
  const [recentExpenses, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fire both requests in parallel — faster than sequential
      const [statsData, expensesData] = await Promise.all([
        getStats(),
        getExpenses({ sort: 'newest' }),
      ])
      setStats(statsData)
      // Keep only the 5 most recent for the transactions panel
      setRecent(expensesData.slice(0, 5))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const { summary, categoryBreakdown, monthlyTrend } = stats
  const totalForPct = categoryBreakdown.reduce((s, c) => s + c.amount, 0)

  // Current month name for the card subtitle
  const currentMonthName = new Date().toLocaleString('en-IN', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's your spending overview."
      />

      <div className="p-4 md:p-8 space-y-5 md:space-y-8">

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading && <LoadingState message="Loading dashboard..." />}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && !loading && (
          <ErrorMessage message={error} onRetry={fetchDashboard} />
        )}

        {/* ── Content ──────────────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <SummaryCard
                title="Total Expenses"
                value={formatAmount(summary.totalAmount)}
                subtitle="All time"
                icon="💰"
                colorClass="bg-indigo-100"
              />
              <SummaryCard
                title="This Month"
                value={formatAmount(summary.currentMonthAmount)}
                subtitle={currentMonthName}
                icon="📅"
                colorClass="bg-blue-100"
              />
              <SummaryCard
                title="No. of Expenses"
                value={summary.totalCount}
                subtitle={`${summary.currentMonthCount} this month`}
                icon="🧾"
                colorClass="bg-green-100"
              />
              <SummaryCard
                title="Average Expense"
                value={formatAmount(Math.round(summary.averageAmount))}
                subtitle="Per transaction"
                icon="📊"
                colorClass="bg-orange-100"
              />
            </div>

            {/* Monthly Spending Bar Chart — full width */}
            <BarChart
              data={monthlyTrend}
              title="Monthly Spending (Last 6 Months)"
            />

            {/* Category Breakdown + Recent Transactions — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-5">
                  Category Breakdown
                </h3>

                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No expenses yet.</p>
                    <button
                      onClick={() => navigate('/expenses')}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Add your first expense →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.map(({ category, amount, count }) => {
                      const pct = totalForPct > 0 ? Math.round((amount / totalForPct) * 100) : 0
                      const badge = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
                      const dot = CATEGORY_DOT_COLORS[category] || 'bg-gray-400'
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
                                {category}
                              </span>
                              <span className="text-xs text-gray-400">
                                {count} {count === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{pct}%</span>
                              <span className="text-sm font-semibold text-gray-700">
                                {formatAmount(amount)}
                              </span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${dot}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-800">
                    Recent Transactions
                  </h3>
                  <button
                    onClick={() => navigate('/expenses')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View all →
                  </button>
                </div>

                {recentExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No transactions yet.</p>
                    <button
                      onClick={() => navigate('/expenses')}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Add your first expense →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => {
                      const id = expense.id || expense._id
                      const dot = CATEGORY_DOT_COLORS[expense.category] || 'bg-gray-400'
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {expense.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400">
                                  {formatDate(expense.date)}
                                </p>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-600'
                                  }`}>
                                  {expense.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 flex-shrink-0 ml-4">
                            {formatAmount(expense.amount)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
