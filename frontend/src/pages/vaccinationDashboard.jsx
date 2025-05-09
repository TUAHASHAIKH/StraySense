import VaccinationSchedule from '../components/vaccinationSchedule';

const Dashboard = () => {
    const userId = 4; // Replace with context or auth value

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-semibold mb-6">My Dashboard</h1>
            <VaccinationSchedule userId={userId} />
        </div>
    );
};

export default Dashboard;
