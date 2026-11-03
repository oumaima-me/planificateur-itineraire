import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function CreateItinerary({ onAjouter }) {
  const [titre, setTitre] = useState("");
  const [destination, setDestination] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const nouvelItineraire = {
      titre,
      destination,
      dateDebut,
      dateFin,
      budgetTotal: Number(budgetTotal),
      etapes: [],
    };

    onAjouter(nouvelItineraire);
  }

  return (
    <div className="create-itinerary">
      <h1>Créer un itinéraire</h1>
      <p>Renseignez les informations de votre prochain voyage.</p>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Titre de l'itinéraire"
            placeholder="Ex : Vacances d'été"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />

          <Input
            label="Destination"
            placeholder="Ex : Marrakech"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />

          <Input
            label="Date de départ"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />

          <Input
            label="Date de retour"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />

          <Input
            label="Budget total (DH)"
            type="number"
            placeholder="Ex : 3000"
            value={budgetTotal}
            onChange={(e) => setBudgetTotal(e.target.value)}
          />

          <Button text="Créer l'itinéraire" type="submit" />
        </form>
      </Card>
    </div>
  );
}

export default CreateItinerary;