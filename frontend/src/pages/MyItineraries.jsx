import { useState } from "react";
import ItineraryCard from "../components/ItineraryCard";
import { Search } from "lucide-react";

function MyItineraries({ itineraires, onOuvrirDetails, onModifierItineraire, onSupprimer }) {
  const [recherche, setRecherche] = useState("");

  const itinerairesFiltres = itineraires.filter(
    (it) =>
      it.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      it.destination.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="my-itineraries">
      <h1>Mes itinéraires</h1>
      <p>Consultez, modifiez ou supprimez vos voyages planifiés.</p>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Rechercher par titre ou destination..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      <div className="itineraries-list">
        {itinerairesFiltres.length > 0 ? (
          itinerairesFiltres.map((itineraire) => (
            <ItineraryCard
              key={itineraire.id}
              itinerary={itineraire}
              onClick={() => onOuvrirDetails(itineraire)}
              onModifier={() => onModifierItineraire(itineraire)}
              onSupprimer={() => onSupprimer(itineraire.id)}
            />
          ))
        ) : (
          <p>Aucun itinéraire trouvé.</p>
        )}
      </div>
    </div>
  );
}

export default MyItineraries;