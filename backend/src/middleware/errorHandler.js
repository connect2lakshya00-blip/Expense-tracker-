/**
 * Global error handling middleware.
 *
 * Express identifies this as an error handler because it has
 * four parameters: (err, req, res, next).
 *
 * Handles specific Mongoose error types and maps them to
 * appropriate HTTP status codes before responding.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // --- Mongoose CastError ---
  // Happens when an invalid MongoDB ObjectId is passed to a query.
  // e.g. GET /api/expenses/not-a-valid-id
  // Without this, Express would return 500. We return 400 instead.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400
    message = `Invalid ID format: "${err.value}"`
  }

  // --- Mongoose ValidationError ---
  // Happens when schema validation fails inside the DB layer
  // (e.g. if the service layer didn't catch it first).
  // Collect all field messages into one readable string.
  if (err.name === 'ValidationError') {
    statusCode = 400
    const messages = Object.values(err.errors).map((e) => e.message)
    message = messages.join(', ')
  }

  // --- Mongoose Duplicate Key Error ---
  // Error code 11000 means a unique index constraint was violated.
  // Not used in our current schema but good practice to handle.
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `Duplicate value for ${field}. Please use a different value.`
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = errorHandler
