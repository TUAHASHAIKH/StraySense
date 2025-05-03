const express = require('express');
const cors = require('cors');
const dbRouter = require('./db.cjs');

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
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

// Simple test endpoint
app.get('/test', (req, res) => {
  res.send('Backend server is running!');
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    const dbRouter = require('./db.cjs');
    const result = await dbRouter.get('/api/test');
    res.json(result);
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Use the database router
app.use(dbRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('CORS enabled for http://localhost:5173');
  console.log('Test endpoints:');
  console.log('- http://localhost:3001/test');
  console.log('- http://localhost:3001/db-test');
}); 