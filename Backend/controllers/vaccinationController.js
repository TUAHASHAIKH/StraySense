import pool from '../database.js';

export const getVaccinationSchedule = async (req, res) => {
  try {
    // Use req.user.user_id from the validated session
    const userId = req.user.user_id;
    
    const [rows] = await pool.execute(`CALL GetVaccinationSchedule(?);`, [userId]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vaccination schedule:', err);
    res.status(500).json({ error: 'Server error' });
  }
};