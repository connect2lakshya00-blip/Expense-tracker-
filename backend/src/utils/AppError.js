/**
 * AppError extends the built-in Error class to add an HTTP statusCode.
 *
 * This lets us throw meaningful HTTP errors from the service layer:
 *
 *   throw new AppError('Expense not found', 404);
 *   throw new AppError('Title is required', 400);
 *
 * The global error handler in middleware/errorHandler.js reads
 * err.statusCode to set the correct HTTP response status.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    // Call the parent Error constructor with the message
    super(message);

    this.statusCode = statusCode;

    // Capture the stack trace, excluding this constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
