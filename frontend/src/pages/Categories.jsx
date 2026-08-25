import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import LoadingState from '../components/ui/LoadingState'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_DOT_COLORS } from '../constants'
import { getExpenses, getErrorMessage } from '../services/expenseService'

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const STORAGE_KEY = 'expenseflow_budgets'

const loadBudgets = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const saveBudgets = (b) => localStorage.setItem(STORAGE_KEY, JSON.stringify(b))

export default function Categories() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState(loadBudgets)
  const [editingBudget, setEditingBudget] = useState(null) // category name or null
  const [budgetInput, setBudgetInput] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    getExpenses()
      .then(setExpenses)
      .catch((err) => console.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  // Build per-category stats from expenses
  const catStats = CATEGORIES.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat)
    const total = catExpenses.reduce((s, e) => s + e.amount, 0)
    const count = catExpenses.length
    const avg = count ? total / count : 0
    const budget = budgets[cat] || 0
    const pct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0
    const over = budget > 0 && total > budget
    return { cat, total, count, avg, budget, pct, over }
  }).sort((a, b) => b.total - a.total)

  const handleBudgetSave = (cat) => {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val >= 0) {
      const updated = { ...budgets, [cat]: val }
      setBudgets(updated)
      saveBudgets(updated)
      setSavedMsg(`Budget saved for ${cat}!`)
      setTimeout(() => setSavedMsg(''), 3000)
    }
    setEditingBudget(null)
    setBudgetInput('')
  }

  const handleBudgetRemove = (cat) => {
    const updated = { ...budgets }
    delete updated[cat]
    setBudgets(updated)
    saveBudgets(updated)
  }

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const catsWithBudget = Object.keys(budgets).length
  const overBudgetCount = catStats.filter(c => c.over).length

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Categories"
        subtitle="Spending overview and budget management."
      />

      <div className="p-4 md:p-8 space-y-5 md:space-y-6">

        {loading && <LoadingState message="Loading categories..." />}

        {savedMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            ✅ {savedMsg}
          </div>
        )}

        {!loading && (
          <>
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-2xl mb-1">💸</div>
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{formatINR(totalSpent)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="text-2xl mb-1">🎯</div>
                <p className="text-xs text-gray-500">Budgets Set</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{catsWithBudget} / {CATEGORIES.length}</p>
              </div>
              <div className={`bg-white rounded-xl shadow-sm border p-5 ${overBudgetCount > 0 ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="text-2xl mb-1">{overBudgetCount > 0 ? '🚨' : '✅'}</div>
                <p className="text-xs text-gray-500">Over Budget</p>
                <p className={`text-lg font-bold mt-1 ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {overBudgetCount} {overBudgetCount === 1 ? 'category' : 'categories'}
                </p>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
              {catStats.map(({ cat, total, count, avg, budget, pct, over }) => {
                const badge = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'
                const dot = CATEGORY_DOT_COLORS[cat] || 'bg-gray-400'
                const isEditing = editingBudget === cat

                return (
                  <div
                    key={cat}
                    className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${over ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${dot}`} />
                        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${badge}`}>{cat}</span>
                        {over && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            Over budget!
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-gray-800">{formatINR(total)}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Expenses</p>
                        <p className="text-sm font-semibold text-gray-700">{count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Average</p>
                        <p className="text-sm font-semibold text-gray-700">{count ? formatINR(Math.round(avg)) : '—'}</p>
                      </div>
                      {budget > 0 && (
                        <div>
                          <p className="text-xs text-gray-400">Budget</p>
                          <p className="text-sm font-semibold text-gray-700">{formatINR(budget)}</p>
                        </div>
                      )}
                      {budget > 0 && (
                        <div>
                          <p className="text-xs text-gray-400">Remaining</p>
                          <p className={`text-sm font-semibold ${over ? 'text-red-600' : 'text-green-600'}`}>
                            {over ? `-${formatINR(total - budget)}` : formatINR(budget - total)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Budget progress bar */}
                    {budget > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{Math.round(pct)}% used</span>
                          <span>{formatINR(total)} / {formatINR(budget)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : pct > 75 ? 'bg-yellow-400' : 'bg-green-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Budget edit */}
                    {isEditing ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          min="0"
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          placeholder="Enter budget (₹)"
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleBudgetSave(cat); if (e.key === 'Escape') { setEditingBudget(null); setBudgetInput('') } }}
                        />
                        <button
                          onClick={() => handleBudgetSave(cat)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingBudget(null); setBudgetInput('') }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => { setEditingBudget(cat); setBudgetInput(budget || '') }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          {budget > 0 ? '✏️ Edit Budget' : '+ Set Budget'}
                        </button>
                        {budget > 0 && (
                          <button
                            onClick={() => handleBudgetRemove(cat)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
