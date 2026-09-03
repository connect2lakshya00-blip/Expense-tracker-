const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { protect, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper: sign a JWT for a user
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

// Helper: build the user object returned to clients (no password)
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

// Simple email format check
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Creates a new user and returns a JWT.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // --- Validation ---
    if (!name || !String(name).trim()) {
      return next(new AppError('Name is required', 400));
    }
    if (!email || !isValidEmail(String(email).trim())) {
      return next(new AppError('Please provide a valid email address', 400));
    }
    if (!password || String(password).length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Check for existing user — use a generic message to avoid email enumeration
    const existing = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existing) {
      return next(new AppError('An account with that email already exists', 409));
    }

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password,
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('An account with that email already exists', 409));
    }
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns a JWT on success.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }
    if (!isValidEmail(String(email).trim())) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Find user by email — use generic error to avoid revealing if email exists
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Returns current user info (protected).
 */
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: formatUser(req.user),
  });
});

module.exports = router;
