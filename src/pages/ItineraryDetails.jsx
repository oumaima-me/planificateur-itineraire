import Card from "../components/Card";

function ItineraryDetails({ itineraire }) {
  if (!itineraire) {
    return <p>Aucun itinéraire sélectionné.</p>;
  }

  return (
    <div className="itinerary-details">
      <h1>{itineraire.titre}</h1>

      <Card>
        <h2>Informations générales</h2>

        <p>Destination : {itineraire.destination}</p>
        <p>Date de départ : {itineraire.dateDebut}</p>
        <p>Date de retour : {itineraire.dateFin}</p>
        <p>Budget total : {itineraire.budgetTotal} DH</p>
      </Card>

      <Card>
        <h2>Les étapes de mon voyage</h2>
        <p>Aucune étape ajoutée pour le moment.</p>
      </Card>
    </div>
  );
}

export default ItineraryDetails;