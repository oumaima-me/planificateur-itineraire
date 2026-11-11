
import Card from "../components/Card";
import ItineraryCard from "../components/ItineraryCard";

function Dashboard({ itineraires, onOuvrirDetails, onSupprimer }) {
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
        {itineraires.length > 0 ? (
          itineraires.map((itineraire) => (
            <ItineraryCard
              key={itineraire.id}
              itinerary={itineraire}
              onClick={() => onOuvrirDetails(itineraire)}
              onSupprimer={() => onSupprimer(itineraire.id)}
            />
          ))
        ) : (
          <p>Aucun itinéraire créé pour le moment.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
