const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// Single hardcoded user — no DB needed for auth
// Password is bcrypt hashed at startup
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Hash the password once at module load time
let hashedPassword = null
;(async () => {
  hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
})()

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { success, token, user: { username } }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return next(new AppError('Username and password are required', 400))
    }

    // Check username
    if (username !== ADMIN_USERNAME) {
      return next(new AppError('Invalid username or password', 401))
    }

    // Check password
    const isMatch = await bcrypt.compare(password, hashedPassword)
    if (!isMatch) {
      return next(new AppError('Invalid username or password', 401))
    }

    // Sign JWT — expires in 7 days
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { username, role: 'admin' },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/auth/me
 * Returns current user info (token required)
 */
router.get('/me', require('../middleware/auth').protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

module.exports = router
