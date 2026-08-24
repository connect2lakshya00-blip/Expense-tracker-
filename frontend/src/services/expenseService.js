import api from './api'

/**
 * expenseService — one function per backend API endpoint.
 *
 * Each function:
 *   - Calls the backend via the configured axios instance
 *   - Returns only the data portion of the response (response.data.data)
 *   - Lets axios errors propagate — the calling page handles them
 *
 * The backend always responds with this envelope:
 *   { success: true, data: <payload>, count?: number, message?: string }
 */

/**
 * Fetch all expenses with optional search, category filter, and sort.
 *
 * @param {Object} params
 * @param {string} [params.search]   - Title search string
 * @param {string} [params.category] - Category name or 'All'
 * @param {string} [params.sort]     - 'newest' | 'oldest' | 'highest' | 'lowest'
 * @returns {Promise<Array>} Array of expense objects
 */
export const getExpenses = async (params = {}) => {
  // Build query string — only include params that have a value
  const query = {}
  if (params.search) query.search = params.search
  if (params.category && params.category !== 'All') query.category = params.category
  if (params.sort) query.sort = params.sort

  const response = await api.get('/expenses', { params: query })
  return response.data.data
}

/**
 * Create a new expense.
 *
 * @param {Object} data - { title, amount, category, date, description }
 * @returns {Promise<Object>} The created expense object
 */
export const createExpense = async (data) => {
  const response = await api.post('/expenses', data)
  return response.data.data
}

/**
 * Update an existing expense by ID.
 *
 * @param {string} id   - The expense's MongoDB _id
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} The updated expense object
 */
export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data)
  return response.data.data
}

/**
 * Delete an expense by ID.
 *
 * @param {string} id - The expense's MongoDB _id
 * @returns {Promise<Object>} The deleted expense object
 */
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`)
  return response.data.data
}

/**
 * Fetch dashboard statistics from the backend.
 * Returns pre-computed summary, category breakdown, and monthly trend.
 *
 * @returns {Promise<Object>} { summary, categoryBreakdown, monthlyTrend }
 */
export const getStats = async () => {
  const response = await api.get('/expenses/stats')
  return response.data.data
}

/**
 * Extract a readable error message from an axios error.
 * Used by pages to display a meaningful message in the UI.
 *
 * @param {Error} error - The error thrown by axios
 * @returns {string} A human-readable error message
 */
export const getErrorMessage = (error) => {
  // The backend returned a response with an error body
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  // The request was made but no response arrived (network error)
  if (error.request) {
    return 'Unable to reach the server. Please check that the backend is running.'
  }
  // Something else went wrong
  return error.message || 'An unexpected error occurred.'
}
