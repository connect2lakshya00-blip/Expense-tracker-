/**
 * Integration tests for the ExpenseFlow REST API.
 *
 * Uses Supertest to fire real HTTP requests against the Express app
 * and a real MongoDB Atlas connection (from .env).
 *
 * Strategy:
 *   - beforeAll: connect to DB, insert known test documents
 *   - afterAll:  delete all test documents, disconnect
 *   - Test documents have titles prefixed with "__TEST__" so they
 *     can be safely deleted without touching real seeded data.
 */

'use strict'

require('dotenv').config()
const mongoose = require('mongoose')
const request  = require('supertest')
const app      = require('../app')
const Expense  = require('../models/Expense')

// ── Shared test state ───────────────────────────────────────────────────────
let testExpenseId   // ID of the primary test expense, used across tests
const TEST_PREFIX = '__TEST__'

// ── Setup / Teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  // Clean up any leftover test documents from a previous failed run
  await Expense.deleteMany({ title: { $regex: `^${TEST_PREFIX}` } })
})

afterAll(async () => {
  // Remove every document this test suite created
  await Expense.deleteMany({ title: { $regex: `^${TEST_PREFIX}` } })
  await mongoose.disconnect()
})

// ── 1. Health Check ─────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns 200 with success:true and timestamp', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toMatch(/healthy/i)
    expect(res.body.timestamp).toBeDefined()
  })
})

// ── 2. Create Expense ────────────────────────────────────────────────────────

describe('POST /api/expenses', () => {
  test('creates a valid expense and returns 201', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        title:       `${TEST_PREFIX} Dinner`,
        amount:      850,
        category:    'Food',
        date:        '2026-08-01',
        description: 'Integration test expense',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe(`${TEST_PREFIX} Dinner`)
    expect(res.body.data.amount).toBe(850)
    expect(res.body.data.category).toBe('Food')
    expect(res.body.data.id).toBeDefined()

    // Save for later tests
    testExpenseId = res.body.data.id
  })

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 100, category: 'Food', date: '2026-08-01' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBeDefined()
  })

  test('returns 400 for whitespace-only title', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: '   ', amount: 100, category: 'Food', date: '2026-08-01' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when amount is 0', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: `${TEST_PREFIX} Zero`, amount: 0, category: 'Food', date: '2026-08-01' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when amount is negative', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: `${TEST_PREFIX} Neg`, amount: -50, category: 'Food', date: '2026-08-01' })
    expect(res.status).toBe(400)
  })

  test('returns 400 for invalid category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: `${TEST_PREFIX} Bad Cat`, amount: 100, category: 'Vacation', date: '2026-08-01' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid category/i)
  })

  test('returns 400 when date is missing', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: `${TEST_PREFIX} NoDate`, amount: 100, category: 'Food' })
    expect(res.status).toBe(400)
  })

  test('returns 400 for invalid date string', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ title: `${TEST_PREFIX} BadDate`, amount: 100, category: 'Food', date: 'not-a-date' })
    expect(res.status).toBe(400)
  })

  test('stores trimmed title and rounded amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        title:    `  ${TEST_PREFIX} Trim  `,
        amount:   99.999,
        category: 'Food',
        date:     '2026-08-01',
      })
    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe(`${TEST_PREFIX} Trim`)
    expect(res.body.data.amount).toBe(100)
  })
})

// ── 3. Get All Expenses ──────────────────────────────────────────────────────

describe('GET /api/expenses', () => {
  test('returns 200 with array and count', async () => {
    const res = await request(app).get('/api/expenses')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(typeof res.body.count).toBe('number')
    expect(res.body.count).toBe(res.body.data.length)
  })

  test('search returns only matching titles (case-insensitive)', async () => {
    const res = await request(app).get(`/api/expenses?search=${TEST_PREFIX}`)
    expect(res.status).toBe(200)
    const titles = res.body.data.map(e => e.title)
    titles.forEach(t => expect(t).toMatch(new RegExp(TEST_PREFIX, 'i')))
  })

  test('search with no match returns empty array', async () => {
    const res = await request(app).get('/api/expenses?search=xyznowaythisexists')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })

  test('category filter returns only matching category', async () => {
    const res = await request(app).get('/api/expenses?category=Food')
    expect(res.status).toBe(200)
    res.body.data.forEach(e => expect(e.category).toBe('Food'))
  })

  test('sort=newest returns dates in descending order', async () => {
    const res = await request(app).get('/api/expenses?sort=newest')
    const dates = res.body.data.map(e => new Date(e.date).getTime())
    const sorted = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(sorted)
  })

  test('sort=oldest returns dates in ascending order', async () => {
    const res = await request(app).get('/api/expenses?sort=oldest')
    const dates = res.body.data.map(e => new Date(e.date).getTime())
    const sorted = [...dates].sort((a, b) => a - b)
    expect(dates).toEqual(sorted)
  })

  test('sort=highest returns amounts in descending order', async () => {
    const res = await request(app).get('/api/expenses?sort=highest')
    const amounts = res.body.data.map(e => e.amount)
    const sorted = [...amounts].sort((a, b) => b - a)
    expect(amounts).toEqual(sorted)
  })

  test('sort=lowest returns amounts in ascending order', async () => {
    const res = await request(app).get('/api/expenses?sort=lowest')
    const amounts = res.body.data.map(e => e.amount)
    const sorted = [...amounts].sort((a, b) => a - b)
    expect(amounts).toEqual(sorted)
  })

  test('combined: category=Food + sort=highest', async () => {
    const res = await request(app).get('/api/expenses?category=Food&sort=highest')
    expect(res.status).toBe(200)
    res.body.data.forEach(e => expect(e.category).toBe('Food'))
    const amounts = res.body.data.map(e => e.amount)
    const sorted  = [...amounts].sort((a, b) => b - a)
    expect(amounts).toEqual(sorted)
  })
})

// ── 4. Get Single Expense ────────────────────────────────────────────────────

describe('GET /api/expenses/:id', () => {
  test('returns 200 with correct expense', async () => {
    const res = await request(app).get(`/api/expenses/${testExpenseId}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(testExpenseId)
  })

  test('returns 400 for malformed ID', async () => {
    const res = await request(app).get('/api/expenses/not-a-valid-id')
    expect(res.status).toBe(400)
  })

  test('returns 404 for valid-format but nonexistent ID', async () => {
    const res = await request(app).get('/api/expenses/64f1a2b3c4d5e6f7a8b9c0d1')
    expect(res.status).toBe(404)
  })
})

// ── 5. Update Expense ────────────────────────────────────────────────────────

describe('PUT /api/expenses/:id', () => {
  test('updates title and amount successfully', async () => {
    const res = await request(app)
      .put(`/api/expenses/${testExpenseId}`)
      .send({ title: `${TEST_PREFIX} Updated Dinner`, amount: 1200 })
    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe(`${TEST_PREFIX} Updated Dinner`)
    expect(res.body.data.amount).toBe(1200)
  })

  test('partial update — only amount changes', async () => {
    const res = await request(app)
      .put(`/api/expenses/${testExpenseId}`)
      .send({ amount: 999 })
    expect(res.status).toBe(200)
    expect(res.body.data.amount).toBe(999)
    // title should be unchanged from previous update
    expect(res.body.data.title).toBe(`${TEST_PREFIX} Updated Dinner`)
  })

  test('returns 400 for malformed ID', async () => {
    const res = await request(app)
      .put('/api/expenses/bad-id')
      .send({ amount: 100 })
    expect(res.status).toBe(400)
  })

  test('returns 404 for nonexistent expense', async () => {
    const res = await request(app)
      .put('/api/expenses/64f1a2b3c4d5e6f7a8b9c0d1')
      .send({ amount: 100 })
    expect(res.status).toBe(404)
  })

  test('returns 400 for invalid amount on update', async () => {
    const res = await request(app)
      .put(`/api/expenses/${testExpenseId}`)
      .send({ amount: -100 })
    expect(res.status).toBe(400)
  })

  test('returns 400 for invalid category on update', async () => {
    const res = await request(app)
      .put(`/api/expenses/${testExpenseId}`)
      .send({ category: 'Vacation' })
    expect(res.status).toBe(400)
  })
})

// ── 6. Stats Endpoint ────────────────────────────────────────────────────────

describe('GET /api/expenses/stats', () => {
  test('returns 200 with correct shape', async () => {
    const res = await request(app).get('/api/expenses/stats')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const { summary, categoryBreakdown, monthlyTrend } = res.body.data

    // Summary shape
    expect(typeof summary.totalAmount).toBe('number')
    expect(typeof summary.totalCount).toBe('number')
    expect(typeof summary.averageAmount).toBe('number')
    expect(typeof summary.currentMonthAmount).toBe('number')
    expect(typeof summary.currentMonthCount).toBe('number')

    // Category breakdown shape
    expect(Array.isArray(categoryBreakdown)).toBe(true)
    if (categoryBreakdown.length > 0) {
      expect(categoryBreakdown[0]).toHaveProperty('category')
      expect(categoryBreakdown[0]).toHaveProperty('amount')
      expect(categoryBreakdown[0]).toHaveProperty('count')
    }

    // Monthly trend — always exactly 6 months
    expect(monthlyTrend).toHaveLength(6)
    monthlyTrend.forEach(m => {
      expect(m).toHaveProperty('month')
      expect(m).toHaveProperty('amount')
      expect(typeof m.amount).toBe('number')
    })
  })

  test('totalCount matches number of documents in DB', async () => {
    const dbCount = await Expense.countDocuments()
    const res     = await request(app).get('/api/expenses/stats')
    expect(res.body.data.summary.totalCount).toBe(dbCount)
  })

  test('totalAmount matches sum of all expense amounts', async () => {
    const expenses   = await Expense.find({})
    const expected   = Math.round(expenses.reduce((s, e) => s + e.amount, 0) * 100) / 100
    const res        = await request(app).get('/api/expenses/stats')
    expect(res.body.data.summary.totalAmount).toBe(expected)
  })

  test('categoryBreakdown is sorted highest amount first', async () => {
    const res     = await request(app).get('/api/expenses/stats')
    const amounts = res.body.data.categoryBreakdown.map(c => c.amount)
    const sorted  = [...amounts].sort((a, b) => b - a)
    expect(amounts).toEqual(sorted)
  })
})

// ── 7. Unknown Route ────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/api/doesnotexist')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  test('POST unknown route returns 404', async () => {
    const res = await request(app).post('/api/doesnotexist').send({})
    expect(res.status).toBe(404)
  })
})

// ── 8. Delete Expense ────────────────────────────────────────────────────────
// Run last — deletes the primary test expense

describe('DELETE /api/expenses/:id', () => {
  test('returns 400 for malformed ID', async () => {
    const res = await request(app).delete('/api/expenses/not-a-valid-id')
    expect(res.status).toBe(400)
  })

  test('returns 404 for nonexistent expense', async () => {
    const res = await request(app).delete('/api/expenses/64f1a2b3c4d5e6f7a8b9c0d1')
    expect(res.status).toBe(404)
  })

  test('deletes existing expense and returns 200', async () => {
    const res = await request(app).delete(`/api/expenses/${testExpenseId}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(testExpenseId)
  })

  test('deleted expense is no longer retrievable', async () => {
    const res = await request(app).get(`/api/expenses/${testExpenseId}`)
    expect(res.status).toBe(404)
  })
})
