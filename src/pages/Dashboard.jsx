import Card from "../components/Card";
import ItineraryCard from "../components/ItineraryCard";

function Dashboard({ itineraires, onOuvrirDetails }) {
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
            onClick={() => onOuvrirDetails(itineraire)}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;