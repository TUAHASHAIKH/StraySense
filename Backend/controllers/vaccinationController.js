import pool from '../database.js'; // This is the only correct import

export const getVaccinationSchedule = async (req, res) => {
  const userId = req.params.userId;
  try {
      const [rows] = await pool.execute(`CALL GetVaccinationSchedule(?);`, [userId]);
      res.json(rows[0]); // Stored procedures return a nested array; first result is rows
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
  }
};

