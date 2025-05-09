import express from 'express';
import pool from '../database.js'; // adjust path if needed

const router = express.Router();

// POST /api/stray-reports
router.post('/', async (req, res) => {
  let { user_id, description, animal_type, animal_size, visible_injuries, province ,city, latitude, longitude } = req.body;

  if (!user_id || !description) {
    return res.status(400).json({ error: 'user_id and description are required' });
  }
  animal_type = animal_type ?? null;
  animal_size = animal_size ?? null;
  visible_injuries = visible_injuries ?? null;
  province = province ?? null;
  city = city ?? null;
  latitude = latitude ?? null;
  longitude = longitude ?? null;


  try {
    const [result] = await pool.execute(
      `CALL SubmitStrayReport(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, description, animal_type, animal_size, visible_injuries, province, city, latitude, longitude]
    );

    res.status(201).json({ message: 'Report submitted successfully', reportId: result.insertId });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
