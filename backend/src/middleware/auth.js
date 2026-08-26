const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')

const JWT_SECRET = process.env.JWT_SECRET || 'expenseflow-secret-key-2026'

/**
 * Protect middleware — verifies JWT token on every protected route.
 * Token should be sent as: Authorization: Bearer <token>
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please log in.', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401))
  }
}

module.exports = { protect, JWT_SECRET }
