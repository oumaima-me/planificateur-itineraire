import { useState } from "react";
import StageCard from "../components/StageCard";
import BudgetSummary from "../components/BudgetSummary";
import Card from "../components/Card";

function ItineraryDetails({ itineraire, onModifierItineraire }) {
  const [ville, setVille] = useState("");
  const [date, setDate] = useState("");

  if (!itineraire) return <p>Aucun itinéraire sélectionné.</p>;

  function ajouterEtape(e) {
    e.preventDefault();
    if (!ville || !date) return;

    const nouvelleEtape = {
      id: Date.now(),
      ordre: itineraire.etapes.length + 1,
      ville,
      date,
      activites: [],
      hebergement: null,
    };

    onModifierItineraire({
      ...itineraire,
      etapes: [...itineraire.etapes, nouvelleEtape],
    });

    setVille("");
    setDate("");
  }

  function modifierEtape(idEtape, etapeModifiee) {
    const nouvellesEtapes = itineraire.etapes.map((e) => (e.id === idEtape ? etapeModifiee : e));
    onModifierItineraire({ ...itineraire, etapes: nouvellesEtapes });
  }

  function supprimerEtape(idEtape) {
    const nouvellesEtapes = itineraire.etapes
      .filter((e) => e.id !== idEtape)
      .map((e, index) => ({ ...e, ordre: index + 1 })); // Réajuster l'ordre
    onModifierItineraire({ ...itineraire, etapes: nouvellesEtapes });
  }

  function ajouterActivite(idEtape, activite) {
    const nouvellesEtapes = itineraire.etapes.map((e) =>
      e.id === idEtape ? { ...e, activites: [...e.activites, activite] } : e
    );
    onModifierItineraire({ ...itineraire, etapes: nouvellesEtapes });
  }

  function ajouterHebergement(idEtape, hebergement) {
    const nouvellesEtapes = itineraire.etapes.map((e) =>
      e.id === idEtape ? { ...e, hebergement } : e
    );
    onModifierItineraire({ ...itineraire, etapes: nouvellesEtapes });
  }

  // Calculs des dépenses
  const depensesActivites = itineraire.etapes.reduce(
    (acc, e) => acc + e.activites.reduce((sum, act) => sum + act.cout, 0),
    0
  );

  const depensesHebergement = itineraire.etapes.reduce(
    (acc, e) => (e.hebergement ? acc + e.hebergement.prixParNuit * e.hebergement.nombreNuits : acc),
    0
  );

  const depensesTotales = depensesActivites + depensesHebergement;

  return (
    <div className="itinerary-details">
      <h1>{itineraire.titre}</h1>

      <Card>
        <h2>Informations générales</h2>
        <p>Destination : {itineraire.destination}</p>
        <p>Du {itineraire.dateDebut} au {itineraire.dateFin}</p>
        <p>Budget total : {itineraire.budgetTotal} DH</p>
      </Card>

      <Card>
        <h2>Ajouter une étape</h2>
        <form onSubmit={ajouterEtape} style={{ display: "flex", gap: "10px" }}>
          <input type="text" placeholder="Ville" value={ville} onChange={(e) => setVille(e.target.value)} required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit">Ajouter l'étape</button>
        </form>
      </Card>

      <Card>
        <h2>Les étapes du voyage</h2>
        {itineraire.etapes?.length > 0 ? (
          itineraire.etapes.map((etape) => (
            <StageCard
              key={etape.id}
              etape={etape}
              onModifierEtape={modifierEtape}
              onSupprimerEtape={supprimerEtape}
              onAjouterActivite={ajouterActivite}
              onAjouterHebergement={ajouterHebergement}
            />
          ))
        ) : (
          <p>Aucune étape enregistrée.</p>
        )}
      </Card>

      <BudgetSummary budgetTotal={itineraire.budgetTotal} depenses={depensesTotales} />
    </div>
  );
}

export default ItineraryDetails;