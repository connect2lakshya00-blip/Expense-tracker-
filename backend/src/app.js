const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// --- Middleware ---
// Allow the React frontend (port 3000) to make requests to this server
app.use(cors());
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
