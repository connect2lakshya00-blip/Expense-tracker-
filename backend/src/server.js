require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the HTTP server.
// This ensures no requests are handled before the database is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ExpenseFlow server running on http://localhost:${PORT}`);
  });
});
