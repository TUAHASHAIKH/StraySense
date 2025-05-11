import express from 'express';
import cors from 'cors';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import strayReportsRoutes from './routes/strayReports.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database.js';
import crypto from 'crypto';

const app = express();
const port = 5000;

// JWT Secret - should be in env vars in production
const JWT_SECRET = 'straysense_secret_key';

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName, phone, addressLine1, addressLine2, city, country, role } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const [existing] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [userResult] = await pool.query(
      'INSERT INTO Users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password_hash, firstName, lastName]
    );
    const user_id = userResult.insertId;
    await pool.query(
      'INSERT INTO UserProfiles (profile_id, user_id, phone, address_line1, address_line2, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, user_id, phone || null, addressLine1 || null, addressLine2 || null, city || null, country || null]
    );
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

    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO Sessions (session_id, user_id, session_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, user.user_id, sessionToken, expiresAt, req.ip, req.headers['user-agent']]
    );

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

app.post('/api/auth/logout', validateSession, async (req, res) => {
  try {
    await pool.query('DELETE FROM Sessions WHERE session_id = ?', [req.user.session_id]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile route
app.get('/api/user/profile', validateSession, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name, 
              up.phone, up.address_line1, up.address_line2, up.city, up.country,
              ur.role_type
       FROM Users u
       LEFT JOIN UserProfiles up ON u.user_id = up.user_id
       LEFT JOIN User_Roles ur ON u.user_id = ur.user_id
       WHERE u.user_id = ?`,
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
      country: user.country,
      role: user.role_type
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile route
app.get('/api/user/profile', validateSession, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name, 
              up.phone, up.address_line1, up.address_line2, up.city, up.country,
              ur.role_type
       FROM Users u
       LEFT JOIN UserProfiles up ON u.user_id = up.user_id
       LEFT JOIN User_Roles ur ON u.user_id = ur.user_id
       WHERE u.user_id = ?`,
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
      country: user.country,
      role: user.role_type
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
app.use('/api/vaccinations', validateSession, vaccinationRoutes);
app.use('/api/stray-reports', validateSession, strayReportsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
