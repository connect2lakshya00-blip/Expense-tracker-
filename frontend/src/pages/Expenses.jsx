import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import ExpenseList from '../components/expenses/ExpenseList'
import ExpenseForm from '../components/expenses/ExpenseForm'
import DeleteModal from '../components/expenses/DeleteModal'
import SearchBar from '../components/filters/SearchBar'
import FilterBar from '../components/filters/FilterBar'
import useDebounce from '../hooks/useDebounce'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getErrorMessage,
} from '../services/expenseService'

export default function Expenses() {
  // ── URL query params ────────────────────────────────────────────────────
  // useSearchParams reads and writes the URL query string reactively.
  // e.g. /expenses?search=dinner&category=Food&sort=newest
  // On mount, initial state is read FROM the URL — so refreshing or
  // sharing the link preserves whatever filters were active.
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialise filter state from URL (falls back to defaults if absent)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All')
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'newest')
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '')

  // ── Debounced search ────────────────────────────────────────────────────
  // The raw `search` state updates on every keystroke (so the input feels
  // responsive), but `debouncedSearch` only updates 350ms after typing stops.
  // The filter logic uses debouncedSearch — avoiding rapid re-renders.
  const debouncedSearch = useDebounce(search, 350)

  // ── Sync filters → URL whenever they change ─────────────────────────────
  useEffect(() => {
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (activeCategory !== 'All') params.category = activeCategory
    if (activeSort !== 'newest') params.sort = activeSort
    if (dateFrom) params.from = dateFrom
    if (dateTo) params.to = dateTo

    // replace: true — don't push a new browser history entry on every
    // keystroke; just update the current URL silently
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, activeCategory, activeSort, dateFrom, dateTo, setSearchParams])

  // ── Data state ──────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── UI state ────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deletingExpense, setDeletingExpense] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // ── Fetch all expenses once on mount ────────────────────────────────────
  const fetchExpenses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getExpenses()
      setExpenses(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  // ── Success toast ───────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // ── Form handlers ───────────────────────────────────────────────────────
  const handleAddClick = () => { setEditingExpense(null); setShowForm(true) }
  const handleEdit = (e) => { setEditingExpense(e); setShowForm(true) }
  const handleCancel = () => { setShowForm(false); setEditingExpense(null) }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (editingExpense) {
        const updated = await updateExpense(editingExpense.id || editingExpense._id, formData)
        setExpenses((prev) =>
          prev.map((e) => (e.id || e._id) === (updated.id || updated._id) ? updated : e)
        )
        showSuccess('Expense updated successfully.')
      } else {
        const created = await createExpense(formData)
        setExpenses((prev) => [created, ...prev])
        showSuccess('Expense added successfully.')
      }
      setShowForm(false)
      setEditingExpense(null)
    } catch (err) {
      setError(getErrorMessage(err))
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete handlers ─────────────────────────────────────────────────────
  const handleDeleteClick = (expense) => setDeletingExpense(expense)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await deleteExpense(deletingExpense.id || deletingExpense._id)
      setExpenses((prev) =>
        prev.filter((e) => (e.id || e._id) !== (deletingExpense.id || deletingExpense._id))
      )
      showSuccess('Expense deleted successfully.')
      setDeletingExpense(null)
    } catch (err) {
      setError(getErrorMessage(err))
      setTimeout(() => setError(null), 5000)
      setDeletingExpense(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Client-side filter + sort ───────────────────────────────────────────
  // We fetch all expenses once and filter locally for instant response.
  // debouncedSearch is used here — not the raw `search` value.
  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    // Search by title — case-insensitive partial match
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter((e) => e.title.toLowerCase().includes(q))
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((e) => e.category === activeCategory)
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter((e) => new Date(e.date) >= new Date(dateFrom))
    }
    if (dateTo) {
      result = result.filter((e) => new Date(e.date) <= new Date(dateTo + 'T23:59:59'))
    }

    // Sort
    switch (activeSort) {
      case 'oldest': result.sort((a, b) => new Date(a.date) - new Date(b.date)); break
      case 'highest': result.sort((a, b) => b.amount - a.amount); break
      case 'lowest': result.sort((a, b) => a.amount - b.amount); break
      default: result.sort((a, b) => new Date(b.date) - new Date(a.date)); break
    }

    return result
  }, [expenses, debouncedSearch, activeCategory, activeSort, dateFrom, dateTo])

  // ── Is any filter active? ────────────────────────────────────────────────
  const isFiltered = debouncedSearch || activeCategory !== 'All' || dateFrom || dateTo

  // ── Clear all filters ───────────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearch('')
    setActiveCategory('All')
    setActiveSort('newest')
    setDateFrom('')
    setDateTo('')
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header
        title="Expenses"
        subtitle={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''} total`}
        action={
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span>+</span> Add Expense
          </button>
        }
      />

      <div className="p-8 space-y-6">

        {/* Success toast */}
        {successMessage && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            <span>✅</span> {successMessage}
          </div>
        )}

        {/* Error banner */}
        {error && !loading && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Add / Edit form panel */}
        {showForm && (
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Search + filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        </div>

        {/* Active filter summary row */}
        {isFiltered && !loading && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">{filteredExpenses.length}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-700">{expenses.length}</span>
              {' '}expense{expenses.length !== 1 ? 's' : ''}
              {debouncedSearch && (
                <> matching <span className="font-semibold text-gray-700">"{debouncedSearch}"</span></>
              )}
              {activeCategory !== 'All' && (
                <> in <span className="font-semibold text-gray-700">{activeCategory}</span></>
              )}
            </p>
            {/* One-click clear all filters */}
            <button
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Expense list */}
        <ExpenseList
          expenses={filteredExpenses}
          loading={loading}
          error={null}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAddFirst={handleAddClick}
          onRetry={fetchExpenses}
        />

      </div>

      {/* Delete modal */}
      {deletingExpense && (
        <DeleteModal
          expense={deletingExpense}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingExpense(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
