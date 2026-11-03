
import StageCard from "../components/StageCard";
import BudgetSummary from "../components/BudgetSummary";
import Card from "../components/Card";

function ItineraryDetails() {
  const itineraire = {
    titre: "Vacances à Marrakech",
    destination: "Marrakech et Essaouira",
    budgetTotal: 3000,
    depenses: 1800,
    etapes: [
      {
        id: 1,
        ordre: 1,
        ville: "Marrakech",
        date: "10/12/2026",
        activites: [
          { id: 1, nom: "Visite de la médina", cout: 100 },
          { id: 2, nom: "Jardin Majorelle", cout: 150 },
        ],
        hebergement: {
          nom: "Riad traditionnel",
          prixParNuit: 400,
        },
      },
      {
        id: 2,
        ordre: 2,
        ville: "Essaouira",
        date: "13/12/2026",
        activites: [
          { id: 3, nom: "Visite de la plage", cout: 50 },
        ],
        hebergement: {
          nom: "Hôtel en centre-ville",
          prixParNuit: 350,
        },
      },
    ],
  };

  return (
    <div className="itinerary-details">
      <h1>{itineraire.titre}</h1>
      <p>Destination : {itineraire.destination}</p>

      <Card>
        <h2>Les étapes de mon voyage</h2>

        {itineraire.etapes.map((etape) => (
          <StageCard key={etape.id} etape={etape} />
        ))}
      </Card>

      <BudgetSummary
        budgetTotal={itineraire.budgetTotal}
        depenses={itineraire.depenses}
      />
    </div>
  );
}

export default ItineraryDetails;
