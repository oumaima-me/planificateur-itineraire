
import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function CreateItinerary() {
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
      budgetTotal,
    };

    console.log(nouvelItineraire);
    alert("Itinéraire créé avec succès !");
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
          />

          <Input
            label="Destination"
            placeholder="Ex : Marrakech"
          />

          <Input
            label="Date de départ"
            type="date"
          />

          <Input
            label="Date de retour"
            type="date"
          />

          <Input
            label="Budget total (DH)"
            type="number"
            placeholder="Ex : 3000"
          />

          <Button
            text="Créer l'itinéraire"
            type="submit"
          />
        </form>
      </Card>
    </div>
  );
}

export default CreateItinerary;
