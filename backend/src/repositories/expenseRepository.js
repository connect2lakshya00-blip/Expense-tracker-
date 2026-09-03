const Expense = require('../models/Expense');

/**
 * Repository layer — all direct MongoDB interactions for expenses.
 *
 * Every operation is scoped to a specific userId so that users can
 * only access their own data.
 */

/**
 * Insert a new expense document.
 * @param {Object} data - Validated expense fields including userId
 * @returns {Promise<Object>} The newly created expense document
 */
const createExpense = async (data) => {
  const expense = await Expense.create(data);
  return expense;
};

/**
 * Retrieve all expenses belonging to a specific user.
 *
 * @param {Object} options
 * @param {Object} options.filter  - Additional Mongoose query filters
 * @param {Object} options.sort    - Mongoose sort object
 * @param {string} options.userId  - The authenticated user's _id
 * @returns {Promise<Array>}
 */
const findAllExpenses = async ({ filter = {}, sort = { date: -1 }, userId } = {}) => {
  const query = { ...filter, user: userId };
  const expenses = await Expense.find(query).sort(sort);
  return expenses;
};

/**
 * Retrieve a single expense by id, scoped to a user.
 *
 * @param {string} id     - The expense's MongoDB _id
 * @param {string} userId - The authenticated user's _id
 * @returns {Promise<Object|null>}
 */
const findExpenseById = async (id, userId) => {
  const expense = await Expense.findOne({ _id: id, user: userId });
  return expense;
};

/**
 * Update an expense, scoped to a user.
 *
 * @param {string} id     - The expense's MongoDB _id
 * @param {string} userId - The authenticated user's _id
 * @param {Object} data   - Fields to update
 * @returns {Promise<Object|null>}
 */
const updateExpense = async (id, userId, data) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: id, user: userId },
    data,
    { new: true, runValidators: true }
  );
  return expense;
};

/**
 * Delete an expense, scoped to a user.
 *
 * @param {string} id     - The expense's MongoDB _id
 * @param {string} userId - The authenticated user's _id
 * @returns {Promise<Object|null>}
 */
const deleteExpense = async (id, userId) => {
  const expense = await Expense.findOneAndDelete({ _id: id, user: userId });
  return expense;
};

module.exports = {
  createExpense,
  findAllExpenses,
  findExpenseById,
  updateExpense,
  deleteExpense,
};
