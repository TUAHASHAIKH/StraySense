// index.js - Main Express server for Stray Sense backend

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';

// Initialize the Express application
const app = express();
const PORT = 5000;

// Enable CORS so frontend can access backend API
app.use(cors());

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'seecs@123', // Replace with your actual MySQL password
  database: 'straysense'
});

// Dummy animal data (replace with MySQL queries in the future)
const animals = [
  {
    id: 1,
    name: "Bella",
    type: "Dog",
    breed: "Beagle",
    age: 2,
    image: "https://placedog.net/400/300?id=1"
  },
  {
    id: 2,
    name: "Milo",
    type: "Cat",
    breed: "Tabby",
    age: 1,
    image: "https://placekitten.com/400/300"
  },
  {
    id: 3,
    name: "Charlie",
    type: "Dog",
    breed: "Labrador",
    age: 3,
    image: "https://placedog.net/400/300?id=2"
  }
  // Add more dummy animals as needed
];

// API endpoint to get all animals
app.get('/api/animals', async (req, res) => {
  // In the future, fetch data from MySQL database here
  // Example:
  // const [rows] = await pool.query('SELECT * FROM animals');
  // res.json(rows);

  res.json(animals);
});

// API endpoint to submit a stray report
app.post('/api/stray-reports', upload.single('image'), async (req, res) => {
  const { user_id, animal_type, description, latitude, longitude, condition } = req.body;
  const imagePath = req.file ? req.file.path : null;
  try {
    const [result] = await pool.query(
      'INSERT INTO stray_reports (user_id, animal_type, description, latitude, longitude, condition, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, animal_type, description, latitude, longitude, condition, imagePath]
    );
    res.status(201).json({ message: 'Stray report submitted successfully', report_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting stray report' });
  }
});

// API endpoint to get all stray reports
app.get('/api/stray-reports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stray_reports');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stray reports' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 