const mongoose = require('mongoose')
const expenseRepository = require('../repositories/expenseRepository')
const AppError = require('../utils/AppError')

/**
 * Service layer — business logic for all expense operations.
 *
 * Responsibilities:
 *   - Validate and sanitise inputs before touching the database
 *   - Throw AppError with correct HTTP status codes
 *   - Build filter/sort objects for queries
 *   - Format Mongoose validation errors into readable messages
 */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// ---------------------------------------------------------------------------
// Input sanitisation helpers
// ---------------------------------------------------------------------------

/**
 * Sanitise and validate the fields of an expense input object.
 * Returns a clean data object ready to be passed to the repository.
 * Throws AppError(400) if any rule is violated.
 *
 * @param {Object} data  - Raw input from the controller
 * @param {boolean} isUpdate - If true, all fields are optional (partial update)
 * @returns {Object} Sanitised data
 */
const sanitiseExpenseInput = (data, isUpdate = false) => {
  const clean = {}

  // --- title ---
  if (data.title !== undefined) {
    const title = String(data.title).trim()
    if (!title) throw new AppError('Title cannot be empty or whitespace only', 400)
    if (title.length > 100) throw new AppError('Title cannot exceed 100 characters', 400)
    clean.title = title
  } else if (!isUpdate) {
    throw new AppError('Title is required', 400)
  }

  // --- amount ---
  if (data.amount !== undefined) {
    const amount = Number(data.amount)
    if (isNaN(amount)) throw new AppError('Amount must be a valid number', 400)
    if (amount <= 0) throw new AppError('Amount must be greater than 0', 400)
    if (amount > 10_000_000) throw new AppError('Amount cannot exceed ₹1,00,00,000', 400)
    // Round to 2 decimal places to avoid floating point issues
    clean.amount = Math.round(amount * 100) / 100
  } else if (!isUpdate) {
    throw new AppError('Amount is required', 400)
  }

  // --- category ---
  const validCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Education', 'Health', 'Other',
  ]
  if (data.category !== undefined) {
    const category = String(data.category).trim()
    if (!validCategories.includes(category)) {
      throw new AppError(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        400
      )
    }
    clean.category = category
  } else if (!isUpdate) {
    throw new AppError('Category is required', 400)
  }

  // --- date ---
  if (data.date !== undefined) {
    const date = new Date(data.date)
    if (isNaN(date.getTime())) throw new AppError('Invalid date format', 400)
    clean.date = date
  } else if (!isUpdate) {
    throw new AppError('Date is required', 400)
  }

  // --- description (optional) ---
  if (data.description !== undefined) {
    const description = String(data.description).trim()
    if (description.length > 500) {
      throw new AppError('Description cannot exceed 500 characters', 400)
    }
    clean.description = description
  }

  return clean
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

const createExpense = async (data) => {
  const clean = sanitiseExpenseInput(data, false)
  try {
    const expense = await expenseRepository.createExpense(clean)
    return expense
  } catch (error) {
    if (error instanceof AppError) throw error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      throw new AppError(messages.join(', '), 400)
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// GET ALL
// ---------------------------------------------------------------------------

const getAllExpenses = async (query = {}) => {
  const { search, category, sort } = query

  const filter = {}

  if (search && String(search).trim()) {
    filter.title = { $regex: String(search).trim(), $options: 'i' }
  }

  const validCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Education', 'Health', 'Other',
  ]
  if (category && category !== 'All' && validCategories.includes(category)) {
    filter.category = category
  }

  let sortObj = { date: -1 }
  if (sort === 'oldest') sortObj = { date: 1 }
  else if (sort === 'highest') sortObj = { amount: -1 }
  else if (sort === 'lowest') sortObj = { amount: 1 }
  else if (sort === 'newest') sortObj = { date: -1 }

  const expenses = await expenseRepository.findAllExpenses({ filter, sort: sortObj })
  return expenses
}

// ---------------------------------------------------------------------------
// GET ONE
// ---------------------------------------------------------------------------

const getExpenseById = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400)
  }
  const expense = await expenseRepository.findExpenseById(id)
  if (!expense) {
    throw new AppError(`Expense not found with ID: ${id}`, 404)
  }
  return expense
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

const updateExpense = async (id, data) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400)
  }
  // isUpdate = true → all fields optional
  const clean = sanitiseExpenseInput(data, true)
  if (Object.keys(clean).length === 0) {
    throw new AppError('No valid fields provided for update', 400)
  }
  try {
    const expense = await expenseRepository.updateExpense(id, clean)
    if (!expense) {
      throw new AppError(`Expense not found with ID: ${id}`, 404)
    }
    return expense
  } catch (error) {
    if (error instanceof AppError) throw error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      throw new AppError(messages.join(', '), 400)
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

const deleteExpense = async (id) => {
  if (!isValidObjectId(id)) {
    throw new AppError(`Invalid expense ID: ${id}`, 400)
  }
  const expense = await expenseRepository.deleteExpense(id)
  if (!expense) {
    throw new AppError(`Expense not found with ID: ${id}`, 404)
  }
  return expense
}

// ---------------------------------------------------------------------------
// STATS
// ---------------------------------------------------------------------------

/**
 * Compute dashboard statistics using MongoDB aggregation.
 *
 * Returns three pieces of data:
 *   summary         — totals, count, average, current-month figures
 *   categoryBreakdown — spending per category, sorted highest first
 *   monthlyTrend    — total spending for each of the last 6 calendar months
 *
 * Using aggregation means the database does the heavy lifting —
 * we never load individual documents into Node just to sum them up.
 *
 * @returns {Promise<Object>} { summary, categoryBreakdown, monthlyTrend }
 */
const getStats = async () => {
  const Expense = require('../models/Expense')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // ── 1. Overall summary ─────────────────────────────────────────────────
  const summaryResult = await Expense.aggregate([
    {
      $facet: {
        // All-time totals
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
        // Current-month totals
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
  ])

  const overall = summaryResult[0]?.overall[0] || {}
  const currentMonth = summaryResult[0]?.currentMonth[0] || {}

  const summary = {
    totalAmount: Math.round((overall.totalAmount || 0) * 100) / 100,
    totalCount: overall.totalCount || 0,
    averageAmount: Math.round((overall.avgAmount || 0) * 100) / 100,
    currentMonthAmount: Math.round((currentMonth.amount || 0) * 100) / 100,
    currentMonthCount: currentMonth.count || 0,
  }

  // ── 2. Category breakdown ──────────────────────────────────────────────
  const categoryResult = await Expense.aggregate([
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
  ])

  // ── 3. Monthly trend — last 6 calendar months ──────────────────────────
  // Build the start date: first day of the month 5 months ago
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const monthlyResult = await Expense.aggregate([
    { $match: { date: { $gte: sixMonthsAgo } } },
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
  ])

  // Build a complete 6-month array — fill months with 0 if no data
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Create a lookup map from aggregation results: "YYYY-M" → amount
  const monthMap = {}
  monthlyResult.forEach(({ _id, amount }) => {
    monthMap[`${_id.year}-${_id.month}`] = Math.round(amount * 100) / 100
  })

  // Fill all 6 months in order
  const monthlyTrend = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1  // getMonth() is 0-indexed
    monthlyTrend.push({
      month: `${MONTH_NAMES[month - 1]} ${year}`,
      amount: monthMap[`${year}-${month}`] || 0,
      count: 0,  // enriched below if needed
    })
  }

  return { summary, categoryBreakdown: categoryResult, monthlyTrend }
}

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getStats,
}
