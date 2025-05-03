import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database.js';

const app = express();
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
    // Create JWT
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { user_id: user.user_id, email: user.email, first_name: user.first_name, last_name: user.last_name } });
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