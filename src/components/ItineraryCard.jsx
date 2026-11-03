function ItineraryCard({ itinerary, onClick }) {
  return (
    <div className="itinerary-card">
      <h3>{itinerary.titre}</h3>

      <p>Destination : {itinerary.destination}</p>

      <p>
        Du {itinerary.dateDebut} au {itinerary.dateFin}
      </p>

      <p>Budget : {itinerary.budgetTotal} DH</p>

      <button onClick={onClick}>
        Voir les détails
      </button>
    </div>
  );
}

export default ItineraryCard;