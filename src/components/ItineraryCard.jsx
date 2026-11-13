import { Edit, Trash2, Eye } from "lucide-react";
import Button from "./Button";

function ItineraryCard({ itinerary, onClick, onModifier, onSupprimer }) {
  return (
    <div className="itinerary-card">
      <h3>{itinerary.titre}</h3>

      <p>Destination : {itinerary.destination}</p>
      <p>Du {itinerary.dateDebut} au {itinerary.dateFin}</p>
      <p>Budget : {Number(itinerary.budgetTotal).toLocaleString("fr-FR")} DH</p>
      <p>Nombre d'étapes : {itinerary.etapes?.length || 0}</p>

      <div className="card-actions">
        <Button onClick={onClick} variant="primary">
          <Eye size={16} /> Détails
        </Button>

        <Button onClick={onModifier} variant="secondary">
          <Edit size={16} /> Modifier
        </Button>

        <Button onClick={onSupprimer} variant="danger">
          <Trash2 size={16} /> Supprimer
        </Button>
      </div>
    </div>
  );
}

export default ItineraryCard;