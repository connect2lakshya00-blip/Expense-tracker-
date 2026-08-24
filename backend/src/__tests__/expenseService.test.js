/**
 * Unit tests for expenseService business logic.
 *
 * These tests do NOT connect to MongoDB.
 * They test the sanitiseExpenseInput logic directly by calling
 * the service functions with controlled inputs and observing
 * whether AppError is thrown with the right message and status code.
 *
 * We mock the repository so no real DB calls happen.
 */

'use strict'

// ── Mock the repository before requiring the service ──────────────────────
// Jest replaces the real repository with an object of no-op mock functions.
// This means the service logic runs but no MongoDB queries fire.
jest.mock('../repositories/expenseRepository', () => ({
  createExpense:   jest.fn(),
  findAllExpenses: jest.fn(),
  findExpenseById: jest.fn(),
  updateExpense:   jest.fn(),
  deleteExpense:   jest.fn(),
}))

require('dotenv').config()
const expenseService = require('../services/expenseService')
const AppError       = require('../utils/AppError')
const expenseRepo    = require('../repositories/expenseRepository')

// ── Helper ─────────────────────────────────────────────────────────────────
// Calls an async function and asserts it throws an AppError with the
// expected status code and a message containing the expected substring.
async function expectAppError(fn, statusCode, messageFragment) {
  try {
    await fn()
    throw new Error('Expected AppError but nothing was thrown')
  } catch (err) {
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(statusCode)
    if (messageFragment) {
      expect(err.message.toLowerCase()).toContain(messageFragment.toLowerCase())
    }
  }
}

// ── Test Suite ──────────────────────────────────────────────────────────────

describe('expenseService — createExpense input validation', () => {

  beforeEach(() => {
    // Reset mock call counts before each test
    jest.clearAllMocks()
    // Default: repository returns a fake saved document
    expenseRepo.createExpense.mockResolvedValue({
      _id: 'fakeid123',
      title: 'Test', amount: 100, category: 'Food',
      date: new Date('2026-08-01'), description: '',
    })
  })

  // ── Title ────────────────────────────────────────────────────────────────

  test('rejects missing title', async () => {
    await expectAppError(
      () => expenseService.createExpense({ amount: 100, category: 'Food', date: '2026-08-01' }),
      400, 'title'
    )
  })

  test('rejects whitespace-only title', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: '   ', amount: 100, category: 'Food', date: '2026-08-01' }),
      400, 'empty'
    )
  })

  test('rejects title longer than 100 characters', async () => {
    await expectAppError(
      () => expenseService.createExpense({
        title: 'a'.repeat(101), amount: 100, category: 'Food', date: '2026-08-01',
      }),
      400, '100'
    )
  })

  test('accepts title of exactly 100 characters', async () => {
    const result = await expenseService.createExpense({
      title: 'a'.repeat(100), amount: 100, category: 'Food', date: '2026-08-01',
    })
    expect(result).toBeDefined()
    expect(expenseRepo.createExpense).toHaveBeenCalledTimes(1)
  })

  test('trims leading/trailing whitespace from title', async () => {
    await expenseService.createExpense({
      title: '  Dinner  ', amount: 100, category: 'Food', date: '2026-08-01',
    })
    const savedData = expenseRepo.createExpense.mock.calls[0][0]
    expect(savedData.title).toBe('Dinner')
  })

  // ── Amount ───────────────────────────────────────────────────────────────

  test('rejects missing amount', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', category: 'Food', date: '2026-08-01' }),
      400, 'amount'
    )
  })

  test('rejects amount = 0', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 0, category: 'Food', date: '2026-08-01' }),
      400, 'greater than 0'
    )
  })

  test('rejects negative amount', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: -50, category: 'Food', date: '2026-08-01' }),
      400, 'greater than 0'
    )
  })

  test('rejects non-numeric amount', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 'abc', category: 'Food', date: '2026-08-01' }),
      400, 'number'
    )
  })

  test('rejects amount exceeding 10,000,000', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 10000001, category: 'Food', date: '2026-08-01' }),
      400, 'exceed'
    )
  })

  test('rounds amount to 2 decimal places', async () => {
    await expenseService.createExpense({
      title: 'Test', amount: 100.999, category: 'Food', date: '2026-08-01',
    })
    const savedData = expenseRepo.createExpense.mock.calls[0][0]
    expect(savedData.amount).toBe(101)
  })

  // ── Category ─────────────────────────────────────────────────────────────

  test('rejects missing category', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 100, date: '2026-08-01' }),
      400, 'category'
    )
  })

  test('rejects invalid category', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 100, category: 'Vacation', date: '2026-08-01' }),
      400, 'invalid category'
    )
  })

  test.each(['Food','Transport','Shopping','Entertainment','Bills','Education','Health','Other'])(
    'accepts valid category: %s', async (category) => {
      const result = await expenseService.createExpense({
        title: 'Test', amount: 100, category, date: '2026-08-01',
      })
      expect(result).toBeDefined()
    }
  )

  // ── Date ─────────────────────────────────────────────────────────────────

  test('rejects missing date', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 100, category: 'Food' }),
      400, 'date'
    )
  })

  test('rejects invalid date string', async () => {
    await expectAppError(
      () => expenseService.createExpense({ title: 'Test', amount: 100, category: 'Food', date: 'not-a-date' }),
      400, 'invalid date'
    )
  })

  test('accepts valid ISO date string', async () => {
    const result = await expenseService.createExpense({
      title: 'Test', amount: 100, category: 'Food', date: '2026-08-15',
    })
    expect(result).toBeDefined()
  })

  // ── Description ──────────────────────────────────────────────────────────

  test('rejects description longer than 500 characters', async () => {
    await expectAppError(
      () => expenseService.createExpense({
        title: 'Test', amount: 100, category: 'Food', date: '2026-08-01',
        description: 'x'.repeat(501),
      }),
      400, '500'
    )
  })

  test('accepts empty description (optional field)', async () => {
    const result = await expenseService.createExpense({
      title: 'Test', amount: 100, category: 'Food', date: '2026-08-01',
      description: '',
    })
    expect(result).toBeDefined()
  })

  // ── Valid full input ──────────────────────────────────────────────────────

  test('calls repository once with sanitised data on valid input', async () => {
    await expenseService.createExpense({
      title: '  Team Lunch  ',
      amount: 850.505,
      category: 'Food',
      date: '2026-08-20',
      description: '  Office team lunch  ',
    })
    expect(expenseRepo.createExpense).toHaveBeenCalledTimes(1)
    const saved = expenseRepo.createExpense.mock.calls[0][0]
    expect(saved.title).toBe('Team Lunch')
    expect(saved.amount).toBe(850.51)
    expect(saved.category).toBe('Food')
    expect(saved.description).toBe('Office team lunch')
  })
})

// ── updateExpense — partial update validation ──────────────────────────────

describe('expenseService — updateExpense validation', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    expenseRepo.updateExpense.mockResolvedValue({
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      title: 'Updated', amount: 200, category: 'Food',
      date: new Date('2026-08-01'),
    })
  })

  test('rejects invalid ObjectId', async () => {
    await expectAppError(
      () => expenseService.updateExpense('not-an-id', { title: 'Test' }),
      400, 'invalid'
    )
  })

  test('rejects empty update body', async () => {
    await expectAppError(
      () => expenseService.updateExpense('64f1a2b3c4d5e6f7a8b9c0d1', {}),
      400, 'no valid fields'
    )
  })

  test('allows partial update — only title', async () => {
    const result = await expenseService.updateExpense(
      '64f1a2b3c4d5e6f7a8b9c0d1', { title: 'New Title' }
    )
    expect(result).toBeDefined()
    const saved = expenseRepo.updateExpense.mock.calls[0][1]
    expect(saved.title).toBe('New Title')
    expect(saved.amount).toBeUndefined()
  })

  test('allows partial update — only amount', async () => {
    await expenseService.updateExpense(
      '64f1a2b3c4d5e6f7a8b9c0d1', { amount: 500 }
    )
    const saved = expenseRepo.updateExpense.mock.calls[0][1]
    expect(saved.amount).toBe(500)
    expect(saved.title).toBeUndefined()
  })

  test('rejects invalid amount on update', async () => {
    await expectAppError(
      () => expenseService.updateExpense('64f1a2b3c4d5e6f7a8b9c0d1', { amount: -10 }),
      400, 'greater than 0'
    )
  })
})

// ── deleteExpense — ID validation ──────────────────────────────────────────

describe('expenseService — deleteExpense validation', () => {

  test('rejects invalid ObjectId format', async () => {
    await expectAppError(
      () => expenseService.deleteExpense('bad-id'),
      400, 'invalid'
    )
  })

  test('rejects well-formed ID that does not exist in DB', async () => {
    expenseRepo.deleteExpense.mockResolvedValue(null)
    await expectAppError(
      () => expenseService.deleteExpense('64f1a2b3c4d5e6f7a8b9c0d1'),
      404, 'not found'
    )
  })
})
