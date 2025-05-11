import VaccinationSchedule from './components/vaccinationSchedule';
import StrayReportForm from './components/StrayReport';
import { AuthProvider } from './context/AuthContext';
import AuthTest from './components/AuthTest';
import './styles/global.css';
import 'leaflet/dist/leaflet.css';
import './fixLeafletIcons';
import NavBar from './components/NavBar';

function App() {
  return (
    <AuthProvider>
      <div className="p-4">
        <NavBar />
        <AuthTest />
        <StrayReportForm />
        <VaccinationSchedule />
      </div>
    </AuthProvider>
  );
}

export default App;
