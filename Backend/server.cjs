const express = require('express');
const cors = require('cors');
const dbRouter = require('./db.cjs');

const app = express();
const port = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Mount the database router at /api
app.use('/api', dbRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- http://localhost:3001/api/test');
  console.log('- http://localhost:3001/api/animals');
  console.log('- http://localhost:3001/api/adopt');
  console.log('- http://localhost:3001/api/sessions');
}); 