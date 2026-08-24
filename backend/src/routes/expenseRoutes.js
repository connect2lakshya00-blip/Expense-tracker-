const express = require('express');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStats,
} = require('../controllers/expenseController');

const router = express.Router();

/**
 * Expense Routes
 *
 * Mounted at /api/expenses in app.js.
 *
 * IMPORTANT: /stats must come BEFORE /:id.
 * If /:id is declared first, Express would treat the literal
 * string "stats" as an ID parameter and call getExpenseById("stats").
 *
 * POST   /api/expenses          → createExpense
 * GET    /api/expenses          → getAllExpenses  (?search= &category= &sort=)
 * GET    /api/expenses/stats    → getStats
 * GET    /api/expenses/:id      → getExpenseById
 * PUT    /api/expenses/:id      → updateExpense
 * DELETE /api/expenses/:id      → deleteExpense
 */

// Collection routes
router.route('/')
  .post(createExpense)
  .get(getAllExpenses)

// Stats route — must be before /:id
router.get('/stats', getStats)

// Individual resource routes
router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense)

module.exports = router;
