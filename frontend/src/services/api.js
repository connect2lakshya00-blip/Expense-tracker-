import axios from 'axios'

/**
 * A single configured axios instance used by all API functions.
 *
 * baseURL: All requests are relative to this — so api.get('/expenses')
 *          becomes GET http://localhost:5000/api/expenses
 *
 * During development, Vite's proxy (vite.config.js) forwards /api
 * requests to http://localhost:5000, so we can also just use '/api'
 * as the baseURL. We use the full URL here to be explicit.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
