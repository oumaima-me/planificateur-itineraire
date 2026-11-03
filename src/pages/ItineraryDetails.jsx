import { useState } from "react";
import StageCard from "../components/StageCard";
import BudgetSummary from "../components/BudgetSummary";
import Card from "../components/Card";

function ItineraryDetails({ itineraire, onModifier }) {
  const [ville, setVille] = useState("");
  const [date, setDate] = useState("");

  if (!itineraire) {
    return <p>Aucun itinéraire sélectionné.</p>;
  }

  function ajouterEtape(e) {
    e.preventDefault();

    if (!ville || !date) {
      return;
    }

    const nouvelleEtape = {
      id: Date.now(),
      ordre: itineraire.etapes.length + 1,
      ville,
      date,
      activites: [],
      hebergement: null,
    };

    const itineraireModifie = {
      ...itineraire,
      etapes: [...itineraire.etapes, nouvelleEtape],
    };

    onModifier(itineraireModifie);

    setVille("");
    setDate("");
  }

  function ajouterActivite(idEtape, activite) {
    const nouvellesEtapes = itineraire.etapes.map((etape) =>
      etape.id === idEtape
        ? { ...etape, activites: [...etape.activites, activite] }
        : etape
    );

    onModifier({ ...itineraire, etapes: nouvellesEtapes });
  }

  function ajouterHebergement(idEtape, hebergement) {
    const nouvellesEtapes = itineraire.etapes.map((etape) =>
      etape.id === idEtape
        ? { ...etape, hebergement }
        : etape
    );

    onModifier({ ...itineraire, etapes: nouvellesEtapes });
  }

  const depensesActivites = itineraire.etapes.reduce(
    (total, etape) =>
      total + etape.activites.reduce(
        (somme, activite) => somme + activite.cout,
        0
      ),
    0
  );

  const depensesHebergement = itineraire.etapes.reduce(
    (total, etape) => {
      if (etape.hebergement) {
        return total +
          etape.hebergement.prixParNuit *
          etape.hebergement.nombreNuits;
      }

      return total;
    },
    0
  );

  const depenses = depensesActivites + depensesHebergement;

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
        <h2>Ajouter une étape</h2>

        <form onSubmit={ajouterEtape}>
          <input
            type="text"
            placeholder="Ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button type="submit">Ajouter une étape</button>
        </form>
      </Card>

      <Card>
        <h2>Les étapes de mon voyage</h2>

        {itineraire.etapes.length > 0 ? (
          itineraire.etapes.map((etape) => (
            <StageCard
              key={etape.id}
              etape={etape}
              onAjouterActivite={ajouterActivite}
              onAjouterHebergement={ajouterHebergement}
            />
          ))
        ) : (
          <p>Aucune étape ajoutée pour le moment.</p>
        )}
      </Card>

      <BudgetSummary
        budgetTotal={itineraire.budgetTotal}
        depenses={depenses}
      />
    </div>
  );
}

export default ItineraryDetails;