// Merged backend server for StraySense (user + admin APIs)
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0305', // Updated password
  database: 'straysense' // Updated database name
});

const JWT_SECRET = 'straysense_secret_key'; // Use env var in production

// --- Multer setup for animal and report pictures ---
const animalPicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frontend/public/animal_pictures'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'animal-' + uniqueSuffix + ext);
  }
});
const uploadAnimalPic = multer({ storage: animalPicStorage });

const strayReportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frontend/public/stray_report_pictures'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'report-' + uniqueSuffix + ext);
  }
});
const uploadStrayReport = multer({ storage: strayReportStorage });

// --- User Auth & Session Middleware (from db.cjs/index.js) ---
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

// --- Admin Auth Middleware ---
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

// --- User Auth Endpoints ---
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
      { user_id: user.user_id, email: user.email, session_id: sessionId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, session_id: sessionId, user: { user_id: user.user_id, email: user.email, first_name: user.first_name, last_name: user.last_name } });
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

// Get user's adoptions (session-based, for /api/user/adoptions)
app.get('/api/user/adoptions', validateSession, async (req, res) => {
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
    console.error('Error fetching adoptions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy stray report endpoint for compatibility with old frontend
app.post('/api/stray-reports', async (req, res) => {
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
    const reportId = result[0][0].report_id;
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId: reportId
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

// --- User Adoptions ---
app.get('/api/adoptions', validateSession, async (req, res) => {
  try {
    const [adoptions] = await pool.query(
      `SELECT a.*, an.name AS animal_name, an.image_path 
       FROM Adoptions a
       JOIN Animals an ON a.animal_id = an.animal_id
       WHERE a.user_id = ?
       ORDER BY a.application_date DESC`,
      [req.user.user_id]
    );
    res.json(adoptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching adoptions' });
  }
});

// Legacy adoption request endpoint for compatibility with old frontend
app.post('/api/adopt', validateSession, async (req, res) => {
  // Accept both session and body user ID for compatibility
  const user_id = req.user?.user_id || req.body.user_id;
  const animal_id = req.body.animal_id || req.body.animalId;

  if (!user_id || !animal_id) {
    return res.status(400).json({ error: 'user_id and animal_id are required' });
  }

  try {
    // First check if the user exists
    const [users] = await pool.query(
      'SELECT user_id FROM Users WHERE user_id = ?',
      [user_id]
    );
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Then check if the animal exists and is available
    const [animals] = await pool.query(
      'SELECT animal_id, status FROM Animals WHERE animal_id = ?',
      [animal_id]
    );
    if (animals.length === 0) {
      return res.status(400).json({ error: 'Animal not found' });
    }
    if (animals[0].status !== 'available') {
      return res.status(400).json({ error: 'Animal is not available for adoption' });
    }

    // Check if there's already a pending adoption request
    const [existingAdoptions] = await pool.query(
      'SELECT adoption_id FROM Adoptions WHERE user_id = ? AND animal_id = ? AND status = "pending"',
      [user_id, animal_id]
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
        `INSERT INTO Adoptions (user_id, animal_id, status) VALUES (?, ?, 'pending')`,
        [user_id, animal_id]
      );

      // Update animal status
      await connection.query(
        'UPDATE Animals SET status = "pending_adoption" WHERE animal_id = ?',
        [animal_id]
      );

      await connection.commit();
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
      details: error.message
    });
  }
});

// --- User Animals ---
app.get('/api/animals', async (req, res) => {
  try {
    const { species, breed, age_min, age_max, size } = req.query;
    let query = 'SELECT * FROM Animals WHERE status = "available"';
    const params = [];
    if (species) {
      query += ' AND species = ?';
      params.push(species);
    }
    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }
    if (age_min) {
      query += ' AND age >= ?';
      params.push(age_min);
    }
    if (age_max) {
      query += ' AND age <= ?';
      params.push(age_max);
    }
    const [animals] = await pool.query(query, params);
    res.json(animals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching animals' });
  }
});

// Get vaccinations for specific animals (for /api/vaccinations/animals)
app.get('/api/vaccinations/animals', async (req, res) => {
  try {
    const { animal_ids } = req.query;
    if (!animal_ids) {
      return res.status(400).json({ error: 'animal_ids query param is required' });
    }
    // Parse animal_ids into an array of integers
    const animalIdArray = animal_ids.split(',').map(id => parseInt(id.trim()));
    // Only fetch for the first animal_id (as in old backend)
    const [vaccinations] = await pool.query('CALL GetVaccinationSchedule(?)', [animalIdArray[0]]);
    res.json(vaccinations[0]);
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
});

// --- Admin Endpoints (from index.js) ---
// Admin login
app.post('/api/admin/verify', async (req, res) => {
  const { password } = req.body;
  if (password !== 'straysense') {
    return res.status(401).json({ message: 'Invalid admin password' });
  }
  const token = jwt.sign(
    { role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token });
});

// Admin dashboard stats
app.get('/api/admin/stats', validateAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM Users');
    const [animalCount] = await pool.query('SELECT COUNT(*) as count FROM Animals');
    const [reportCount] = await pool.query('SELECT COUNT(*) as count FROM Stray_Reports WHERE status = "pending"');
    const [shelterCount] = await pool.query('SELECT COUNT(*) as count FROM Shelters');
    const [adoptionCount] = await pool.query('SELECT COUNT(*) as count FROM Adoptions WHERE status = "pending"');
    const [pendingVaccCount] = await pool.query('SELECT COUNT(*) as count FROM Vaccinations WHERE completed_date IS NULL');
    res.json({
      totalUsers: userCount[0].count,
      totalAnimals: animalCount[0].count,
      activeReports: reportCount[0].count,
      totalShelters: shelterCount[0].count,
      activeAdoptionRequests: adoptionCount[0].count,
      pendingVaccinations: pendingVaccCount[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin animal management
app.get('/api/admin/animals', validateAdmin, async (req, res) => {
  try {
    const [animals] = await pool.query('SELECT * FROM Animals');
    res.json(animals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/animal/upload', validateAdmin, uploadAnimalPic.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imagePath = `/animal_pictures/${req.file.filename}`;
  res.json({ image_path: imagePath });
});

app.post('/api/admin/animals', validateAdmin, async (req, res) => {
  let data = req.body;
  try {
    const neutered = data.neutered === 'true' || data.neutered === true;
    const age = data.age ? parseInt(data.age, 10) : null;
    const shelter_id = data.shelter_id ? parseInt(data.shelter_id, 10) : null;
    let animal_id;
    if (data.report_id) {
      const [lastAnimal] = await pool.query('SELECT animal_id FROM Animals ORDER BY animal_id DESC LIMIT 1');
      animal_id = lastAnimal.length > 0 ? lastAnimal[0].animal_id + 1 : 1;
      await pool.query(
        'INSERT INTO Animals (animal_id, name, species, breed, age, gender, health_status, neutered, shelter_id, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [animal_id, data.name, data.species, data.breed, age, data.gender, data.health_status, neutered, shelter_id, data.status || 'available', data.image_path]
      );
      await pool.query(
        'UPDATE Stray_Reports SET processed_animal_id = ? WHERE report_id = ?',
        [animal_id, data.report_id]
      );
    } else {
      const [result] = await pool.query(
        'INSERT INTO Animals (name, species, breed, age, gender, health_status, neutered, shelter_id, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.species, data.breed, age, data.gender, data.health_status, neutered, shelter_id, data.status || 'available', data.image_path]
      );
      animal_id = result.insertId;
    }
    res.status(201).json({ animal_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/animals/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, species, breed, age, gender, health_status, neutered, shelter_id, status, image_path } = req.body;
  try {
    await pool.query(
      'UPDATE Animals SET name=?, species=?, breed=?, age=?, gender=?, health_status=?, neutered=?, shelter_id=?, status=?, image_path=? WHERE animal_id=?',
      [name, species, breed, age, gender, health_status, neutered, shelter_id, status, image_path, id]
    );
    res.json({ message: 'Animal updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Admin shelter management
app.get('/api/admin/shelters', validateAdmin, async (req, res) => {
  try {
    const [shelters] = await pool.query('SELECT * FROM Shelters ORDER BY name');
    res.json(shelters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/shelters', validateAdmin, async (req, res) => {
  const { name, address, city, country, phone, email } = req.body;
  if (!name || !address || !city || !country) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO Shelters (name, address, city, country, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, city, country, phone || null, email || null]
    );
    const [newShelter] = await pool.query('SELECT * FROM Shelters WHERE shelter_id = ?', [result.insertId]);
    res.status(201).json(newShelter[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/shelters/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, address, city, country, phone, email } = req.body;
  if (!name || !address || !city || !country) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await pool.query(
      'UPDATE Shelters SET name = ?, address = ?, city = ?, country = ?, phone = ?, email = ? WHERE shelter_id = ?',
      [name, address, city, country, phone || null, email || null, id]
    );
    const [updatedShelter] = await pool.query('SELECT * FROM Shelters WHERE shelter_id = ?', [id]);
    if (updatedShelter.length === 0) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    res.json(updatedShelter[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/shelters/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [animals] = await pool.query('SELECT COUNT(*) as count FROM Animals WHERE shelter_id = ?', [id]);
    if (animals[0].count > 0) {
      return res.status(400).json({ message: 'Cannot delete shelter with associated animals' });
    }
    const [result] = await pool.query('DELETE FROM Shelters WHERE shelter_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    res.json({ message: 'Shelter deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin stray reports management
app.get('/api/admin/reports', validateAdmin, async (req, res) => {
  try {
    const [reports] = await pool.query(`
      SELECT sr.*, u.first_name, u.last_name 
      FROM Stray_Reports sr
      JOIN Users u ON sr.user_id = u.user_id
      ORDER BY sr.report_date DESC
    `);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/reports/:id/status', validateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      'UPDATE Stray_Reports SET status = ?, accepted_date = ? WHERE report_id = ?',
      [status, status === 'accepted' ? new Date() : null, id]
    );
    res.json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin adoption management
app.get('/api/admin/adoptions', validateAdmin, async (req, res) => {
  try {
    const [adoptions] = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, an.name AS animal_name
      FROM Adoptions a
      JOIN Users u ON a.user_id = u.user_id
      JOIN Animals an ON a.animal_id = an.animal_id
      ORDER BY a.application_date DESC
    `);
    res.json(adoptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/adoptions/:id/status', validateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, home_check_passed, fee_paid, contract_signed } = req.body;
  try {
    let updateFields = 'status=?';
    let params = [status];
    if (typeof home_check_passed !== 'undefined') {
      updateFields += ', home_check_passed=?';
      params.push(!!home_check_passed);
    }
    if (typeof fee_paid !== 'undefined') {
      updateFields += ', fee_paid=?';
      params.push(!!fee_paid);
    }
    if (typeof contract_signed !== 'undefined') {
      updateFields += ', contract_signed=?';
      params.push(!!contract_signed);
    }
    if (status === 'approved') {
      updateFields += ', approval_date=?';
      params.push(new Date());
    }
    params.push(id);
    await pool.query(`UPDATE Adoptions SET ${updateFields} WHERE adoption_id=?`, params);
    res.json({ message: 'Adoption request updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin vaccine types management
app.get('/api/admin/vaccines', validateAdmin, async (req, res) => {
  try {
    const [vaccines] = await pool.query('SELECT * FROM Vaccine_Types ORDER BY name');
    res.json(vaccines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/vaccines', validateAdmin, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const [result] = await pool.query('INSERT INTO Vaccine_Types (name, description) VALUES (?, ?)', [name, description || null]);
    const [newVaccine] = await pool.query('SELECT * FROM Vaccine_Types WHERE vaccine_id = ?', [result.insertId]);
    res.status(201).json(newVaccine[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/vaccines/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    await pool.query('UPDATE Vaccine_Types SET name=?, description=? WHERE vaccine_id=?', [name, description || null, id]);
    const [updated] = await pool.query('SELECT * FROM Vaccine_Types WHERE vaccine_id=?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/vaccines/:id', validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Vaccine_Types WHERE vaccine_id=?', [id]);
    res.json({ message: 'Vaccine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin vaccinations management
app.post('/api/admin/vaccinations', validateAdmin, async (req, res) => {
  const { animal_id, vaccine_id, scheduled_date } = req.body;
  if (!animal_id || !vaccine_id || !scheduled_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO Vaccinations (animal_id, vaccine_id, scheduled_date) VALUES (?, ?, ?)',
      [animal_id, vaccine_id, scheduled_date]
    );
    res.status(201).json({ message: 'Vaccination scheduled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/vaccinations', validateAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.vaccination_id, a.name AS animal_name, vt.name AS vaccine_name, v.scheduled_date, v.completed_date
      FROM Vaccinations v
      JOIN Animals a ON v.animal_id = a.animal_id
      JOIN Vaccine_Types vt ON v.vaccine_id = vt.vaccine_id
      ORDER BY v.scheduled_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/vaccinations/:id/complete', validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE Vaccinations SET completed_date = CURDATE() WHERE vaccination_id = ?', [id]);
    res.json({ message: 'Vaccination marked as done' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 