import express from 'express';
import { getVaccinationSchedule } from '../controllers/vaccinationController.js';

const router = express.Router();

router.get('/user/:userId/schedule', getVaccinationSchedule);

export default router;
