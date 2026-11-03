
import Card from "../components/Card";
import ItineraryCard from "../components/ItineraryCard";

function Dashboard() {
  const itineraires = [
    {
      id: 1,
      titre: "Vacances à Marrakech",
      destination: "Marrakech",
      dateDebut: "10/12/2026",
      dateFin: "15/12/2026",
      budgetTotal: 3000,
    },
    {
      id: 2,
      titre: "Découverte de Fès",
      destination: "Fès",
      dateDebut: "20/12/2026",
      dateFin: "23/12/2026",
      budgetTotal: 2000,
    },
  ];

  return (
    <div className="dashboard">
      <h1>Bienvenue sur votre tableau de bord !</h1>
      <p>Organisez et gérez facilement vos voyages.</p>

      <div className="dashboard-stats">
        <Card>
          <h3>Mes itinéraires</h3>
          <p>{itineraires.length}</p>
        </Card>

        <Card>
          <h3>Application</h3>
          <p>Planificateur de voyages</p>
        </Card>
      </div>

      <h2>Mes derniers itinéraires</h2>

      <div className="itineraries-list">
        {itineraires.map((itineraire) => (
          <ItineraryCard
            key={itineraire.id}
            itinerary={itineraire}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
