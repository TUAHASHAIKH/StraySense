const mysql = require('mysql2/promise');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

const router = express.Router();

// Enable CORS
router.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

router.use(express.json());

const JWT_SECRET = 'straysense_secret_key'; // Use env var in production

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

// Initialize database tables
async function initializeTables() {
  try {
    const connection = await pool.getConnection();
    
    // Create Sessions table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Sessions (
        session_id CHAR(36) PRIMARY KEY,
        user_id INT NOT NULL,
        session_token CHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create Users table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert some test users if none exist
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    if (users[0].count === 0) {
      await connection.execute(`
        INSERT INTO Users (first_name, last_name, email) VALUES
        ('John', 'Doe', 'john@example.com'),
        ('Jane', 'Smith', 'jane@example.com'),
        ('Bob', 'Johnson', 'bob@example.com')
      `);
    }
    
    // Insert some test sessions if none exist
    const [sessions] = await connection.execute('SELECT COUNT(*) as count FROM Sessions');
    if (sessions[0].count === 0) {
      await connection.execute(`
        INSERT INTO Sessions (user_id, expires_at) VALUES
        (1, DATE_ADD(NOW(), INTERVAL 24 HOUR)),
        (2, DATE_ADD(NOW(), INTERVAL 24 HOUR)),
        (3, DATE_ADD(NOW(), INTERVAL 24 HOUR))
      `);
    }
    
    connection.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Call initializeTables when the server starts
initializeTables();

// Test endpoint to check database connection and data
router.get('/test', async (req, res) => {
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
router.get('/animals', async (req, res) => {
  try {
    console.log('Fetching available animals from database...');
    const connection = await pool.getConnection();
    
    // First, let's see what's in the table
    const [allRows] = await connection.execute('SELECT * FROM animals');
    console.log('All animals in database:', allRows);
    
    // Now get available animals
    const [rows] = await connection.execute(
      'SELECT * FROM animals WHERE status = "available"'
    );
    console.log('Available animals:', rows);
    
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals', details: error.message });
  }
});

// Get animal by ID
router.get('/animals/:id', async (req, res) => {
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

// Handle adoption requests
router.post('/adopt', async (req, res) => {
  console.log('Received adoption request:', req.body);
  const { userId, animalId } = req.body;
  
  if (!userId || !animalId) {
    console.log('Missing required fields:', { userId, animalId });
    return res.status(400).json({ error: 'User ID and Animal ID are required' });
  }

  try {
    // First check if the user exists
    const [users] = await pool.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Then check if the animal exists and is available
    const [animals] = await pool.query(
      'SELECT animal_id, status FROM animals WHERE animal_id = ?',
      [animalId]
    );

    if (animals.length === 0) {
      return res.status(400).json({ error: 'Animal not found' });
    }

    if (animals[0].status !== 'available') {
      return res.status(400).json({ error: 'Animal is not available for adoption' });
    }

    // Check if there's already a pending adoption request
    const [existingAdoptions] = await pool.query(
      'SELECT adoption_id FROM adoptions WHERE user_id = ? AND animal_id = ? AND status = "pending"',
      [userId, animalId]
    );

    if (existingAdoptions.length > 0) {
      return res.status(400).json({ error: 'You already have a pending adoption request for this animal' });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into adoptions table with only the required fields
      const [result] = await connection.query(
        `INSERT INTO adoptions (user_id, animal_id, status) VALUES (?, ?, 'pending')`,
        [userId, animalId]
      );
      
      // Update animal status
      await connection.query(
        'UPDATE animals SET status = "pending_adoption" WHERE animal_id = ?',
        [animalId]
      );

      await connection.commit();
      console.log('Adoption request created:', result);

      res.json({ 
        message: 'Adoption request submitted successfully',
        requestId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ 
      error: 'Failed to submit adoption request', 
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// Get adoption status
router.get('/adoptions/:userId', async (req, res) => {
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
router.put('/adoptions/:adoptionId', async (req, res) => {
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

// Get all users
router.get('/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT user_id, first_name, last_name, email FROM Users'
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get active sessions
router.get('/sessions', async (req, res) => {
  try {
    console.log('Fetching active sessions...');
    const connection = await pool.getConnection();
    
    // First, let's check what's in the Sessions table
    const [allSessions] = await connection.execute('SELECT * FROM Sessions');
    console.log('All sessions in database:', allSessions);
    
    // Now get active sessions with user details
    const [rows] = await connection.execute(
      `SELECT s.session_id, s.user_id, u.first_name, u.last_name, u.email 
       FROM Sessions s 
       LEFT JOIN Users u ON s.user_id = u.user_id 
       WHERE s.expires_at > NOW()`
    );
    console.log('Active sessions with user details:', rows);
    
    connection.release();
    
    if (rows.length === 0) {
      console.log('No active sessions found');
      return res.json([]);
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      details: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint to check Sessions table
router.get('/test-sessions', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Check if Sessions table exists
    const [tables] = await connection.execute(
      'SHOW TABLES LIKE "Sessions"'
    );
    
    if (tables.length === 0) {
      return res.status(404).json({ error: 'Sessions table does not exist' });
    }
    
    // Get table structure
    const [columns] = await connection.execute(
      'DESCRIBE Sessions'
    );
    
    // Get sample data
    const [rows] = await connection.execute(
      'SELECT * FROM Sessions'
    );
    
    connection.release();
    
    res.json({
      tableExists: true,
      structure: columns,
      sampleData: rows
    });
  } catch (error) {
    console.error('Error checking Sessions table:', error);
    res.status(500).json({ 
      error: 'Failed to check Sessions table',
      details: error.message 
    });
  }
});

// Signup endpoint
router.post('/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName, phone, addressLine1, addressLine2, city, country, role } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user
    const [userResult] = await pool.query(
      'INSERT INTO Users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password_hash, firstName, lastName]
    );
    const user_id = userResult.insertId;
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await pool.query(
      'INSERT INTO Sessions (session_id, user_id, session_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, user.user_id, sessionToken, expiresAt, req.ip, req.headers['user-agent']]
    );

    // Create JWT with session info
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        email: user.email,
        session_id: sessionId 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      session_id: sessionId,
      user: { 
        user_id: user.user_id, 
        email: user.email, 
        first_name: user.first_name, 
        last_name: user.last_name 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Session validation middleware
const validateSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [sessions] = await pool.query(
      'SELECT * FROM Sessions WHERE session_id = ? AND expires_at > NOW()',
      [decoded.session_id]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.user = decoded;
    req.session = sessions[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Logout endpoint
router.post('/auth/logout', validateSession, async (req, res) => {
  try {
    await pool.query('DELETE FROM Sessions WHERE session_id = ?', [req.user.session_id]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/user/profile', validateSession, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, email, first_name, last_name FROM Users WHERE user_id = ?',
      [req.user.user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's adoptions
router.get('/user/adoptions', validateSession, async (req, res) => {
  try {
    const [adoptions] = await pool.query(
      `SELECT a.*, an.name as animal_name, an.species, an.breed 
       FROM Adoptions a 
       JOIN Animals an ON a.animal_id = an.animal_id 
       WHERE a.user_id = ?`,
      [req.user.user_id]
    );
    res.json(adoptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 