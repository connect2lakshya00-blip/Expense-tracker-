import api from './api'

const TOKEN_KEY = 'expenseflow_token'
const USER_KEY = 'expenseflow_user'

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password })
  const { token, user } = response.data
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // Attach token to all future requests
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  return user
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  delete api.defaults.headers.common['Authorization']
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false
  try {
    // Check expiry by decoding payload (no crypto needed)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// Auto-attach token on page load if already logged in
const savedToken = getToken()
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
}
