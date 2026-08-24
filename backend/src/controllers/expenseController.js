const expenseService = require('../services/expenseService');

/**
 * Controller layer — HTTP request handlers for expense operations.
 *
 * Each controller function:
 *   1. Extracts data from the request (body, params, query)
 *   2. Calls the appropriate service function
 *   3. Sends the HTTP response
 *
 * Errors are caught and forwarded to Express's global error handler
 * via next(error). The controller itself never decides what status
 * code an error should have — that is the service's responsibility
 * (via AppError).
 */

// ---------------------------------------------------------------------------
// POST /api/expenses
// ---------------------------------------------------------------------------

/**
 * Create a new expense.
 * Reads the expense fields from req.body.
 * Returns 201 Created with the new expense on success.
 */
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const expense = await expenseService.createExpense({
      title,
      amount,
      category,
      description,
      date,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/expenses
// ---------------------------------------------------------------------------

/**
 * Get all expenses.
 * Reads optional search, category, and sort from req.query.
 * Returns 200 OK with an array of expenses.
 */
const getAllExpenses = async (req, res, next) => {
  try {
    // req.query contains the URL query string parameters:
    // e.g. GET /api/expenses?search=dinner&category=Food&sort=newest
    const expenses = await expenseService.getAllExpenses(req.query);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/expenses/:id
// ---------------------------------------------------------------------------

/**
 * Get a single expense by ID.
 * Reads the expense ID from req.params.id.
 * Returns 200 OK with the expense on success.
 * Service throws 400 for invalid ID, 404 if not found.
 */
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/expenses/:id
// ---------------------------------------------------------------------------

/**
 * Update an existing expense.
 * Reads the expense ID from req.params.id.
 * Reads updated fields from req.body.
 * Returns 200 OK with the updated expense on success.
 * Service throws 400 for invalid ID or bad data, 404 if not found.
 */
const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const expense = await expenseService.updateExpense(req.params.id, {
      title,
      amount,
      category,
      description,
      date,
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/expenses/:id
// ---------------------------------------------------------------------------

/**
 * Delete an expense.
 * Reads the expense ID from req.params.id.
 * Returns 200 OK with the deleted expense on success.
 * Service throws 400 for invalid ID, 404 if not found.
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.deleteExpense(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/expenses/stats
// ---------------------------------------------------------------------------

/**
 * Get dashboard statistics.
 * Returns summary totals, category breakdown, and monthly trend.
 * No parameters required.
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await expenseService.getStats()
    res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStats,
};
