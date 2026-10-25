#!/usr/bin/env node
const app = require('./app.js');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;

// Connect to DB then start server with error handling
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Try a different PORT.`);
    } else {
      console.error('Server error:', err);
    }
  });
});
