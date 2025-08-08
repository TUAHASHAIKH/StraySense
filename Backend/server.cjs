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
  password: '0305', // Replace with your actual MySQL password
  database: 'straysense'
});

// Stray reports endpoint
app.post('/api/stray-reports', async (req, res) => {
  console.log('Received stray report:', req.body);
  
  // Validate required fields
  const requiredFields = ['user_id', 'description', 'animal_type', 'animal_size', 'province', 'city', 'latitude', 'longitude'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: `Missing fields: ${missingFields.join(', ')}`
    });
  }
  
  const connection = await pool.getConnection();
  
  try {
    // Call the stored procedure
    const [result] = await connection.query(
      'CALL SubmitStrayReport(?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    
    // The stored procedure returns the report_id in the first result set
    const reportId = result[0][0].report_id;
    
    console.log('Report inserted successfully:', { reportId });
    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully',
      reportId: reportId
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    
    // Handle specific error cases
    if (error.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({
        error: 'Invalid user ID',
        details: 'The specified user does not exist'
      });
    }
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        error: 'Data too long',
        details: 'One or more fields exceed the maximum length'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit report',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Get user's adoptions
app.get('/api/adoptions/:userId', async (req, res) => {
  console.log('Getting adoptions for user:', req.params.userId);
  
  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      'CALL GetUserAdoptions(?)',
      [req.params.userId]
    );
    
    console.log('Adoptions retrieved successfully:', result[0]);
    res.json({ 
      success: true, 
      adoptions: result[0]
    });
  } catch (error) {
    console.error('Error getting adoptions:', error);
    res.status(500).json({ 
      error: 'Failed to get adoptions',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Submit adoption request
app.post('/api/adopt', async (req, res) => {
  console.log('Received adoption request:', req.body);
  
  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      'CALL SubmitAdoption(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.body.user_id,
        req.body.animal_id,
        req.body.adoption_reason,
        req.body.housing_type,
        req.body.has_other_pets,
        req.body.other_pets_details || null,
        req.body.has_children,
        req.body.children_details || null,
        req.body.work_schedule,
        req.body.experience_level
      ]
    );
    
    const adoptionId = result[0][0].adoption_id;
    
    console.log('Adoption request submitted successfully:', { adoptionId });
    res.status(201).json({ 
      success: true, 
      message: 'Adoption request submitted successfully',
      adoptionId: adoptionId
    });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ 
      error: 'Failed to submit adoption request',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Update adoption status
app.put('/api/adoptions/:adoptionId/status', async (req, res) => {
  console.log('Updating adoption status:', { adoptionId: req.params.adoptionId, status: req.body.status });
  
  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      'CALL UpdateAdoptionStatus(?, ?)',
      [req.params.adoptionId, req.body.status]
    );
    
    console.log('Adoption status updated successfully:', result);
    res.json({ 
      success: true, 
      message: 'Adoption status updated successfully'
    });
  } catch (error) {
    console.error('Error updating adoption status:', error);
    res.status(500).json({ 
      error: 'Failed to update adoption status',
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- http://localhost:5000/api/test');
  console.log('- http://localhost:5000/api/animals');
  console.log('- http://localhost:5000/api/adopt');
  console.log('- http://localhost:5000/api/sessions');
  console.log('- http://localhost:5000/api/stray-reports');
}); 