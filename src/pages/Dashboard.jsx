import Card from "../components/Card";
import ItineraryCard from "../components/ItineraryCard";

function Dashboard({ itineraires, onOuvrirDetails, onModifierItineraire, onSupprimer }) {
  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>
      <p>Organisez vos prochaines aventures ! Bienvenue sur votre espace de planification.</p>

      <div className="dashboard-stats" style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
        <Card>
          <h3>Mes itinéraires</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{itineraires.length}</p>
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
              onModifier={() => onModifierItineraire(itineraire)}
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