import api from './api';

const TOKEN_KEY = 'expenseflow_token';
const USER_KEY = 'expenseflow_user';

/**
 * Register a new account.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} user object { id, name, email }
 */
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  const { token, user } = response.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return user;
};

/**
 * Log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} user object { id, name, email }
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return user;
};

/**
 * Clear session data and remove the auth header.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete api.defaults.headers.common['Authorization'];
};

/** Return the stored JWT string, or null. */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Return the stored user object, or null. */
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

/**
 * Return true if a non-expired JWT is stored locally.
 * (Decodes the payload without verifying the signature — the server
 * will reject actually-invalid tokens on the next API call.)
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Auto-attach token on page load if the user is already logged in
const savedToken = getToken();
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}
