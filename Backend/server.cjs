const express = require('express');
const cors = require('cors');
const dbRouter = require('./db.cjs');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Use the database router
app.use(dbRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('CORS enabled for http://localhost:5173');
  console.log('Test endpoints:');
  console.log('- http://localhost:3001/api/test');
  console.log('- http://localhost:3001/api/animals');
}); 