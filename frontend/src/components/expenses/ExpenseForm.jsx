import { useState, useEffect } from 'react'
import { CATEGORIES } from '../../constants'

// Default empty form state — used when adding a new expense
const EMPTY_FORM = {
  title: '',
  amount: '',
  category: '',
  date: '',
  description: '',
}

/**
 * ExpenseForm handles both Add and Edit modes.
 *
 * Props:
 *   expense     — if provided, the form is in Edit mode and pre-fills with this data
 *   onSubmit    — called with the form data when the user submits
 *   onCancel    — called when the user clicks Cancel
 *   isSubmitting — disables the submit button while the API call is in progress
 */
export default function ExpenseForm({ expense, onSubmit, onCancel, isSubmitting }) {
  const isEditMode = Boolean(expense)

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // When editing, pre-fill the form with the existing expense data
  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title || '',
        amount: expense.amount || '',
        // Format date to YYYY-MM-DD for the date input
        date: expense.date ? expense.date.slice(0, 10) : '',
        category: expense.category || '',
        description: expense.description || '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [expense])

  // Update one field in the form state
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear the error for this field as soon as the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Client-side validation before submitting
  const validate = () => {
    const newErrors = {}

    // --- title ---
    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) {
      newErrors.title = 'Title is required'
    } else if (trimmedTitle.length < 2) {
      newErrors.title = 'Title must be at least 2 characters'
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters'
    }

    // --- amount ---
    if (form.amount === '' || form.amount === null || form.amount === undefined) {
      newErrors.amount = 'Amount is required'
    } else {
      const amt = Number(form.amount)
      if (isNaN(amt)) {
        newErrors.amount = 'Amount must be a valid number'
      } else if (amt <= 0) {
        newErrors.amount = 'Amount must be greater than 0'
      } else if (amt > 10000000) {
        newErrors.amount = 'Amount cannot exceed ₹1,00,00,000'
      }
    }

    // --- category ---
    if (!form.category) {
      newErrors.category = 'Category is required'
    }

    // --- date ---
    if (!form.date) {
      newErrors.date = 'Date is required'
    } else {
      const selected = new Date(form.date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // allow today
      if (isNaN(selected.getTime())) {
        newErrors.date = 'Invalid date'
      } else if (selected > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }

    // --- description ---
    if (form.description && form.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    // Pass clean data to the parent — amount as a number
    onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      description: form.description.trim(),
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Edit Expense' : 'Add New Expense'}
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Dinner with friends"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Amount and Category — side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().slice(0, 10)}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {/* Character counter — turns red when over limit */}
            <span className={`text-xs ${form.description.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
              {form.description.length}/500
            </span>
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add a note..."
            rows={3}
            maxLength={520}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? (isEditMode ? 'Saving...' : 'Adding...')
              : (isEditMode ? 'Save Changes' : 'Add Expense')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}
