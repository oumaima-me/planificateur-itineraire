import { useState, useEffect } from "react";

function CreateItinerary({ onEnregistrer, itineraireAModifier, onAnnulerModification }) {
  const [titre, setTitre] = useState("");
  const [destination, setDestination] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");

  useEffect(() => {
    if (itineraireAModifier) {
      setTitre(itineraireAModifier.titre);
      setDestination(itineraireAModifier.destination);
      setDateDebut(itineraireAModifier.dateDebut);
      setDateFin(itineraireAModifier.dateFin);
      setBudgetTotal(itineraireAModifier.budgetTotal);
    } else {
      setTitre("");
      setDestination("");
      setDateDebut("");
      setDateFin("");
      setBudgetTotal("");
    }
  }, [itineraireAModifier]);

  function handleSubmit(e) {
    e.preventDefault();

    const donneesItineraire = {
      id: itineraireAModifier ? itineraireAModifier.id : Date.now(),
      titre,
      destination,
      dateDebut,
      dateFin,
      budgetTotal: Number(budgetTotal),
      etapes: itineraireAModifier ? itineraireAModifier.etapes || [] : [],
    };

    onEnregistrer(donneesItineraire);
  }

  return (
    <div className="create-itinerary">
      <h1>{itineraireAModifier ? "Modifier l'itinéraire" : "Créer un nouvel itinéraire"}</h1>
      <p>
        {itineraireAModifier
          ? "Mettez à jour les informations générales. Pour gérer les étapes, ouvrez les détails de l'itinéraire."
          : "Définissez les bases de votre voyage. Vous pourrez ensuite ajouter vos étapes dans les détails."}
      </p>

      <form onSubmit={handleSubmit} className="card">
        <div className="input-group">
          <label>Titre du voyage</label>
          <input
            type="text"
            placeholder="Ex: Découverte du Sud Marocain"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Destination principale</label>
          <input
            type="text"
            placeholder="Ex: Marrakech - Merzouga"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Date de début</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Date de fin</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Budget total prévu (DH)</label>
          <input
            type="number"
            placeholder="Ex: 6000"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(e.target.value)}
            min="0"
            required
          />
        </div>

        <div className="card-actions">
          <button type="submit" className="button-primary">
            {itineraireAModifier ? "Enregistrer les modifications" : "Créer l'itinéraire"}
          </button>

          {itineraireAModifier && (
            <button type="button" onClick={onAnnulerModification} className="button-secondary">
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateItinerary;