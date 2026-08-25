const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// --- Middleware ---
// Allow the React frontend to make requests to this server
// In production, restrict to the deployed Vercel frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
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
// Parse incoming request bodies as JSON so req.body works
app.use(express.json());

// --- Health Check ---
// A simple endpoint to confirm the API server is alive.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExpenseFlow API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
// Mount the expense router — all routes inside are prefixed with /api/expenses
app.use('/api/expenses', expenseRoutes);

// --- 404 Handler ---
// If a request reaches here, no route above matched it.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// --- Global Error Handler ---
// Must be registered LAST, after all routes.
// Express recognises it as an error handler because of the 4 parameters.
app.use(errorHandler);

module.exports = app;
