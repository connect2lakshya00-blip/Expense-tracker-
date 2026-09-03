const expenseService = require('../services/expenseService');

/**
 * Controller layer — HTTP request handlers for expense operations.
 *
 * Each handler extracts data from the request, passes req.user._id
 * to the service for user-scoped data access, and sends the response.
 */

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const expense = await expenseService.createExpense(
      { title, amount, category, description, date },
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses
const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await expenseService.getAllExpenses(req.query, req.user._id);

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const expense = await expenseService.updateExpense(
      req.params.id,
      req.user._id,
      { title, amount, category, description, date }
    );

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.deleteExpense(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await expenseService.getStats(req.user._id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStats,
};
