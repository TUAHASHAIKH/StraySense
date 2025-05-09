import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database.js';
import crypto from 'crypto';
import cors from 'cors';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const JWT_SECRET = 'straysense_secret_key'; // Use env var in production

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
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
    // Insert profile
    await pool.query(
      'INSERT INTO UserProfiles (profile_id, user_id, phone, address_line1, address_line2, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_id, phone || null, addressLine1 || null, addressLine2 || null, city || null, country || null]
    );
    // Insert role
    await pool.query(
      'INSERT INTO User_Roles (user_id, role_type) VALUES (?, ?)',
      [user_id, role || 'adopter']
    );
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
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

// Add session validation middleware
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

// Protected route example
app.get('/api/user/profile', validateSession, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT u.*, up.* FROM Users u LEFT JOIN UserProfiles up ON u.user_id = up.user_id WHERE u.user_id = ?',
      [req.user.user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.json({
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      address_line1: user.address_line1,
      address_line2: user.address_line2,
      city: user.city,
      country: user.country
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', validateSession, async (req, res) => {
  try {
    await pool.query('DELETE FROM Sessions WHERE session_id = ?', [req.user.session_id]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin verification endpoint
app.post('/api/admin/verify', async (req, res) => {
  const { password } = req.body;
  
  if (password !== 'straysense') {
    return res.status(401).json({ message: 'Invalid admin password' });
  }

  // Create admin session token
  const token = jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token });
});

// Admin middleware
const validateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected admin route example
app.get('/api/admin/stats', validateAdmin, async (req, res) => {
  try {
    // Get total users
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM Users');
    
    // Get total animals
    const [animalCount] = await pool.query('SELECT COUNT(*) as count FROM Animals');
    
    // Get total stray reports
    const [reportCount] = await pool.query('SELECT COUNT(*) as count FROM Stray_Reports WHERE status = "pending"');

    res.json({
      totalUsers: userCount[0].count,
      totalAnimals: animalCount[0].count,
      activeReports: reportCount[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all animals
app.get('/api/admin/animals', validateAdmin, async (req, res) => {
  try {
    const [animals] = await pool.query('SELECT * FROM Animals');
    res.json(animals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new animal
app.post('/api/admin/animals', validateAdmin, async (req, res) => {
  const { name, species, breed, age, gender, health_status, neutered, shelter_id, status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Animals (name, species, breed, age, gender, health_status, neutered, shelter_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, species, breed, age, gender, health_status, neutered, shelter_id, status]
    );
    res.status(201).json({ animal_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit animal
app.put('/api/admin/animals/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, species, breed, age, gender, health_status, neutered, shelter_id, status } = req.body;
  try {
    await pool.query(
      'UPDATE Animals SET name=?, species=?, breed=?, age=?, gender=?, health_status=?, neutered=?, shelter_id=?, status=? WHERE animal_id=?',
      [name, species, breed, age, gender, health_status, neutered, shelter_id, status, id]
    );
    res.json({ message: 'Animal updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete animal
app.delete('/api/admin/animals/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Animals WHERE animal_id=?', [id]);
    res.json({ message: 'Animal deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
}); 