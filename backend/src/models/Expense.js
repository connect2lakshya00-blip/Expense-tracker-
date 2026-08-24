const mongoose = require('mongoose');

/**
 * The Expense Schema defines the structure and validation rules
 * for every expense document stored in MongoDB.
 *
 * Mongoose enforces these rules before saving to the database.
 */
const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true, // removes leading/trailing whitespace automatically
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      // Only these values are accepted — anything else is rejected
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Entertainment',
          'Bills',
          'Education',
          'Health',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '', // optional field — defaults to empty string
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields to every document
    timestamps: true,

    // Adds a virtual 'id' field (string) alongside MongoDB's '_id' (ObjectId).
    // This makes it easier to work with on the frontend — we use 'id' not '_id'.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export the model — Mongoose will use the collection name 'expenses' (lowercase plural)
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
