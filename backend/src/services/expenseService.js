const mongoose = require('mongoose');
const expenseRepository = require('../repositories/expenseRepository');
const AppError = require('../utils/AppError');

/**
 * Service layer — business logic for all expense operations.
 *
 * Every operation receives a userId and passes it to the repository
 * so that each user can only access their own expenses.
 */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------------------------------------------------------------------------
// Input sanitisation helpers
// ---------------------------------------------------------------------------

const sanitiseExpenseInput = (data, isUpdate = false) => {
  const clean = {};

  // --- title ---
  if (data.title !== undefined) {
    const title = String(data.title).trim();
    if (!title) throw new AppError('Title cannot be empty or whitespace only', 400);
    if (title.length > 100) throw new AppError('Title cannot exceed 100 characters', 400);
    clean.title = title;
  } else if (!isUpdate) {
    throw new AppError('Title is required', 400);
  }

  // --- amount ---
  if (data.amount !== undefined) {
    const amount = Number(data.amount);
    if (isNaN(amount)) throw new AppError('Amount must be a valid number', 400);
    if (amount <= 0) throw new AppError('Amount must be greater than 0', 400);
    if (amount > 10_000_000) throw new AppError('Amount cannot exceed ₹1,00,00,000', 400);
    clean.amount = Math.round(amount * 100) / 100;
  } else if (!isUpdate) {
    throw new AppError('Amount is required', 400);
  }

  // --- category ---
  const validCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Education', 'Health', 'Other',
  ];
  if (data.category !== undefined) {
    const category = String(data.category).trim();
    if (!validCategories.includes(category)) {
      throw new AppError(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        400
      );
    }
    clean.category = category;
  } else if (!isUpdate) {
    throw new AppError('Category is required', 400);
  }

  // --- date ---
  if (data.date !== undefined) {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) throw new AppError('Invalid date format', 400);
    clean.date = date;
  } else if (!isUpdate) {
    throw new AppError('Date is required', 400);
  }

  // --- description (optional) ---
  if (data.description !== undefined) {
    const description = String(data.description).trim();
    if (description.length > 500) {
      throw new AppError('Description cannot exceed 500 characters', 400);
    }
    clean.description = description;
  }

  return clean;
};

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

const createExpense = async (data, userId) => {
  const clean = sanitiseExpenseInput(data, false);
  clean.user = userId;
  try {
    const expense = await expenseRepository.createExpense(clean);
    return expense;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new AppError(messages.join(', '), 400);
    }
    throw error;
  }
};

// ---------------------------------------------------------------------------
// GET ALL
// ---------------------------------------------------------------------------

const getAllExpenses = async (query = {}, userId) => {
  const { search, category, sort } = query;

  const filter = {};

  if (search && String(search).trim()) {
    filter.title = { $regex: String(search).trim(), $options: 'i' };
  }

  const validCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Education', 'Health', 'Other',
  ];
  if (category && category !== 'All' && validCategories.includes(category)) {
    filter.category = category;
  }

  let sortObj = { date: -1 };
  if (sort === 'oldest') sortObj = { date: 1 };
  else if (sort === 'highest') sortObj = { amount: -1 };
  else if (sort === 'lowest') sortObj = { amount: 1 };
  else if (sort === 'newest') sortObj = { date: -1 };

  const expenses = await expenseRepository.findAllExpenses({ filter, sort: sortObj, userId });
  return expenses;
};

// ---------------------------------------------------------------------------
// GET ONE
// ---------------------------------------------------------------------------

const getExpenseById = async (id, userId) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400);
  }
  const expense = await expenseRepository.findExpenseById(id, userId);
  if (!expense) {
    throw new AppError(`Expense not found with ID: ${id}`, 404);
  }
  return expense;
};

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

const updateExpense = async (id, userId, data) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400);
  }
  const clean = sanitiseExpenseInput(data, true);
  if (Object.keys(clean).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }
  try {
    const expense = await expenseRepository.updateExpense(id, userId, clean);
    if (!expense) {
      throw new AppError(`Expense not found with ID: ${id}`, 404);
    }
    return expense;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new AppError(messages.join(', '), 400);
    }
    throw error;
  }
};

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

const deleteExpense = async (id, userId) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400);
  }
  const expense = await expenseRepository.deleteExpense(id, userId);
  if (!expense) {
    throw new AppError(`Expense not found with ID: ${id}`, 404);
  }
  return expense;
};

// ---------------------------------------------------------------------------
// STATS — scoped to a single user
// ---------------------------------------------------------------------------

const getStats = async (userId) => {
  const Expense = require('../models/Expense');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const userFilter = { user: new mongoose.Types.ObjectId(userId) };

  // ── 1. Overall summary ─────────────────────────────────────────────────
  const summaryResult = await Expense.aggregate([
    { $match: userFilter },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              totalCount: { $sum: 1 },
              avgAmount: { $avg: '$amount' },
            },
          },
        ],
        currentMonth: [
          { $match: { date: { $gte: startOfMonth } } },
          {
            $group: {
              _id: null,
              amount: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const overall = summaryResult[0]?.overall[0] || {};
  const currentMonth = summaryResult[0]?.currentMonth[0] || {};

  const summary = {
    totalAmount: Math.round((overall.totalAmount || 0) * 100) / 100,
    totalCount: overall.totalCount || 0,
    averageAmount: Math.round((overall.avgAmount || 0) * 100) / 100,
    currentMonthAmount: Math.round((currentMonth.amount || 0) * 100) / 100,
    currentMonthCount: currentMonth.count || 0,
  };

  // ── 2. Category breakdown ──────────────────────────────────────────────
  const categoryResult = await Expense.aggregate([
    { $match: userFilter },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { amount: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id',
        amount: { $round: ['$amount', 2] },
        count: 1,
      },
    },
  ]);

  // ── 3. Monthly trend — last 6 calendar months ──────────────────────────
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyResult = await Expense.aggregate([
    { $match: { ...userFilter, date: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthMap = {};
  monthlyResult.forEach(({ _id, amount }) => {
    monthMap[`${_id.year}-${_id.month}`] = Math.round(amount * 100) / 100;
  });

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    monthlyTrend.push({
      month: `${MONTH_NAMES[month - 1]} ${year}`,
      amount: monthMap[`${year}-${month}`] || 0,
      count: 0,
    });
  }

  return { summary, categoryBreakdown: categoryResult, monthlyTrend };
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStats,
};
