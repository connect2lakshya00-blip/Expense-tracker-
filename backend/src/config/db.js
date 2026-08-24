const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGO_URI from the .env file.
 * Called once when the server starts — before app.listen().
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit the process — there is no point running the server
    // if it cannot reach the database.
    process.exit(1);
  }
};

module.exports = connectDB;
