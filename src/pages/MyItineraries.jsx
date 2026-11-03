
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ItineraryCard from "../components/ItineraryCard";

function MyItineraries() {
  const [recherche, setRecherche] = useState("");

  const itineraires = [
    {
      id: 1,
      titre: "Vacances à Marrakech",
      destination: "Marrakech",
      dateDebut: "10/12/2026",
      dateFin: "15/12/2026",
      budgetTotal: 3000,
    },
    {
      id: 2,
      titre: "Découverte de Fès",
      destination: "Fès",
      dateDebut: "20/12/2026",
      dateFin: "23/12/2026",
      budgetTotal: 2000,
    },
  ];

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
