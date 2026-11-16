import Card from "../components/Card";
import ItineraryCard from "../components/ItineraryCard";
import { ShieldCheck } from "lucide-react";

function Dashboard({ itineraires, utilisateur, onOuvrirDetails, onModifierItineraire, onSupprimer, onNavigate }) {
  return (
    <div className="dashboard">
      <h1>Tableau de bord</h1>
      <p>Organisez vos prochaines aventures ! Bienvenue sur votre espace de planification.</p>

      <div className="dashboard-stats">
        <Card>
          <h3>Mes itinéraires</h3>
          <p>{itineraires.length}</p>
        </Card>

        {utilisateur?.role === "admin" && (
          <div onClick={() => onNavigate("admin")} className="card admin-card">
            <h3>
              <ShieldCheck size={20} /> Espace Admin
            </h3>
            <p>Gérer les utilisateurs du système &rarr;</p>
          </div>
        )}
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