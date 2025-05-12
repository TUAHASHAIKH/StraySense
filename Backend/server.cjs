const express = require('express');
const cors = require('cors');
const router = require('./db.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Use the router for all /api routes
app.use('/api', router);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log('\n=== New Request ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  console.log('==================\n');
  next();
});

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0305',
  database: 'straysense'
});

// Stray reports endpoint
app.post('/api/stray-reports', async (req, res) => {
  console.log('Received stray report:', req.body);
  
  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      `INSERT INTO stray_reports (
        user_id,
        description,
        animal_type,
        animal_size,
        visible_injuries,
        province,
        city,
        latitude,
        longitude,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        req.body.user_id,
        req.body.description,
        req.body.animal_type,
        req.body.animal_size,
        req.body.visible_injuries || null,
        req.body.province,
        req.body.city,
        req.body.latitude,
        req.body.longitude
      ]
    );
    
    console.log('Report inserted successfully:', result);
    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ 
      error: 'Failed to submit report',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- http://localhost:3001/api/test');
  console.log('- http://localhost:3001/api/animals');
  console.log('- http://localhost:3001/api/adopt');
  console.log('- http://localhost:3001/api/sessions');
  console.log('- http://localhost:3001/api/stray-reports');
}); 