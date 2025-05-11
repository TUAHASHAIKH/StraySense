import express from 'express';
import { getVaccinationSchedule } from '../controllers/vaccinationController.js';

const router = express.Router();

// Get vaccination schedule for the authenticated user
router.get('/schedule', getVaccinationSchedule);

export default router;
