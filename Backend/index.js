// index.js - Main Express server for Stray Sense backend

import express from 'express';
import cors from 'cors';

// Initialize the Express application
const app = express();
const PORT = 5000;

// Enable CORS so frontend can access backend API
app.use(cors());

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

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 