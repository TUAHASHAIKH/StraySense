const mysql = require('mysql2/promise');
const express = require('express');

const router = express.Router();

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '0305',
  database: 'straysense'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection immediately
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err);
  });

// Test endpoint to check database connection and data
router.get('/api/test', async (req, res) => {
  try {
    console.log('Testing database connection (GET)...');
    const connection = await pool.getConnection();
    console.log('Successfully connected to database');
    
    const [rows] = await connection.execute('SELECT * FROM animals');
    console.log('Raw database response:', rows);
    
    connection.release();
    console.log('Database connection successful. Found', rows.length, 'animals');
    res.json({ 
      message: 'Database connection successful',
      count: rows.length,
      animals: rows 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// Get all available animals
router.get('/api/animals', async (req, res) => {
  try {
    console.log('Fetching available animals from database...');
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM animals WHERE status = "available"'
    );
    connection.release();
    console.log('Database query result:', rows);
    console.log('Found', rows.length, 'available animals');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// Get animal by ID
router.get('/api/animals/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM animals WHERE animal_id = ?',
      [req.params.id]
    );
    connection.release();
    if (rows.length === 0) {
      res.status(404).json({ error: 'Animal not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

// Create adoption record and update animal status
router.post('/api/adopt', async (req, res) => {
  const { user_id, animal_id } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create adoption record
      const [adoptionResult] = await connection.execute(
        'INSERT INTO adoptions (user_id, animal_id, status, application_date) VALUES (?, ?, "pending", NOW())',
        [user_id, animal_id]
      );

      // Update animal status
      await connection.execute(
        'UPDATE animals SET status = "pending_adoption" WHERE animal_id = ?',
        [animal_id]
      );

      await connection.commit();
      res.json({ 
        message: 'Adoption request submitted successfully',
        adoption_id: adoptionResult.insertId 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error processing adoption:', error);
    res.status(500).json({ error: 'Failed to process adoption request' });
  }
});

// Get adoption status
router.get('/api/adoptions/:userId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT a.*, an.name as animal_name, an.species, an.breed 
       FROM Adoptions a 
       JOIN Animals an ON a.animal_id = an.animal_id 
       WHERE a.user_id = ?`,
      [req.params.userId]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    res.status(500).json({ error: 'Failed to fetch adoptions' });
  }
});

// Update adoption status (for admin use)
router.put('/api/adoptions/:adoptionId', async (req, res) => {
  const { status } = req.body;
  const adoptionId = req.params.adoptionId;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update adoption status
      await connection.execute(
        'UPDATE Adoptions SET status = ?, approval_date = NOW() WHERE adoption_id = ?',
        [status, adoptionId]
      );

      // If approved, update animal status to adopted
      if (status === 'approved') {
        await connection.execute(
          `UPDATE Animals a 
           JOIN Adoptions ad ON a.animal_id = ad.animal_id 
           SET a.status = 'adopted' 
           WHERE ad.adoption_id = ?`,
          [adoptionId]
        );
      }

      await connection.commit();
      res.json({ message: 'Adoption status updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating adoption status:', error);
    res.status(500).json({ error: 'Failed to update adoption status' });
  }
});

module.exports = router; 