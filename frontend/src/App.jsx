import VaccinationSchedule from './components/vaccinationSchedule';
import StrayReportForm from './components/StrayReport';

import './styles/global.css';
import 'leaflet/dist/leaflet.css';
import './fixLeafletIcons';
import NavBar from './components/NavBar';


function App() {
  const userId = 4; // Replace this with the actual logged-in user ID when available

  return (
    
    <div className="p-4">
      <NavBar />
      <StrayReportForm userId={userId} />
    </div>
  );
}

export default App;
