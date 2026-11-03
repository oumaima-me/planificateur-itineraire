import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ItineraryCard from "../components/ItineraryCard";

function MyItineraries({ itineraires, onOuvrirDetails }) {
  const [recherche, setRecherche] = useState("");

  const itinerairesFiltres = itineraires.filter((itineraire) =>
    itineraire.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    itineraire.destination.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="my-itineraries">
      <h1>Mes itinéraires</h1>
      <p>Retrouvez et gérez tous vos voyages.</p>

      <SearchBar
        placeholder="Rechercher un itinéraire..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      <div className="itineraries-list">
        {itinerairesFiltres.length > 0 ? (
          itinerairesFiltres.map((itineraire) => (
            <ItineraryCard
              key={itineraire.id}
              itinerary={itineraire}
              onClick={() => onOuvrirDetails(itineraire)}
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