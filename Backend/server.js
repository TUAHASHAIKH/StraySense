import express from 'express';
import cors from 'cors'; // ✅ import cors
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import strayReportsRoutes from './routes/strayReports.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 5000;

// ✅ use cors middleware BEFORE routes
app.use(cors({
  origin: 'http://localhost:5173', // allow requests from React dev server
  credentials: true
}));

app.use(express.json()); // also good to have this for parsing JSON
app.use('/api/vaccinations', vaccinationRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/stray-reports', strayReportsRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
