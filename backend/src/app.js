const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/auth')

const app = express();

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}));
app.use(express.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExpenseFlow API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// --- Auth Routes (public) ---
app.use('/api/auth', authRoutes);

// --- API Routes (protected) ---
app.use('/api/expenses', protect, expenseRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

module.exports = app;
