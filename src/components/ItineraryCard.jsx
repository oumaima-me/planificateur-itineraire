
import Button from "./Button";

function ItineraryCard({ itinerary, onClick, onSupprimer }) {
  return (
    <div className="itinerary-card">
      <h3>{itinerary.titre}</h3>

      <p>
        Destination : {itinerary.destination}
      </p>

      <p>
        Du {itinerary.dateDebut} au {itinerary.dateFin}
      </p>

      <p>
        Budget : {Number(itinerary.budgetTotal).toLocaleString("fr-FR")} DH
      </p>

      <p>
        Nombre d'étapes : {itinerary.etapes?.length || 0}
      </p>

      <div className="card-actions">
        <Button onClick={onClick}>
          Voir les détails
        </Button>

        <Button onClick={onSupprimer} variant="danger">
          Supprimer
        </Button>
      </div>
    </div>
  );
}

export default ItineraryCard;
