const Expense = require('../models/Expense');

/**
 * Repository layer — all direct MongoDB interactions for expenses.
 *
 * No business logic lives here. Each function does exactly one
 * database operation and returns the raw result to the caller.
 */

/**
 * Insert a new expense document into the database.
 * @param {Object} data - Validated expense fields from the service layer
 * @returns {Promise<Object>} The newly created expense document
 */
const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

/**
 * Retrieve all expense documents, with optional filtering and sorting.
 *
 * @param {Object} options
 * @param {Object} options.filter  - Mongoose query filter (e.g. { category: 'Food' })
 * @param {Object} options.sort    - Mongoose sort object (e.g. { date: -1 } for newest first)
 * @returns {Promise<Array>} Array of expense documents
 */
const findAllExpenses = async ({ filter = {}, sort = { date: -1 } } = {}) => {
  const expenses = await Expense.find(filter).sort(sort);
  return expenses;
};

/**
 * Retrieve a single expense document by its MongoDB _id.
 * Returns null if no document with that id exists.
 *
 * @param {string} id - The expense's MongoDB _id as a string
 * @returns {Promise<Object|null>}
 */
const findExpenseById = async (id) => {
  const expense = await Expense.findById(id);
  return expense;
};

/**
 * Update an expense document and return the updated version.
 *
 * { new: true }    → return the document AFTER the update (not before)
 * { runValidators: true } → run schema validators on the updated fields
 *
 * @param {string} id   - The expense's MongoDB _id
 * @param {Object} data - Fields to update
 * @returns {Promise<Object|null>} The updated expense, or null if not found
 */
const updateExpense = async (id, data) => {
  const expense = await Expense.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return expense;
};

/**
 * Delete an expense document by its MongoDB _id.
 * Returns the deleted document, or null if not found.
 *
 * @param {string} id - The expense's MongoDB _id
 * @returns {Promise<Object|null>} The deleted expense, or null if not found
 */
const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);
  return expense;
};

module.exports = {
  createExpense,
  findAllExpenses,
  findExpenseById,
  updateExpense,
  deleteExpense,
};
