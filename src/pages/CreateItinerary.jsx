import { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

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
    }
  }, [itineraireAModifier]);

  function handleSubmit(e) {
    e.preventDefault();
    const donneesItineraire = {
      ...(itineraireAModifier ? itineraireAModifier : {}),
      id: itineraireAModifier ? itineraireAModifier.id : Date.now(),
      titre,
      destination,
      dateDebut,
      dateFin,
      budgetTotal: Number(budgetTotal),
      etapes: itineraireAModifier ? itineraireAModifier.etapes : [],
    };

    onEnregistrer(donneesItineraire);
  }

  return (
    <div className="create-itinerary">
      <h1>{itineraireAModifier ? "Modifier l'itinéraire" : "Créer un itinéraire"}</h1>
      <p>{itineraireAModifier ? "Mettez à jour les informations de votre voyage." : "Renseignez les informations de votre prochain voyage."}</p>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
          <Input label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <Input label="Date de départ" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
          <Input label="Date de retour" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
          <Input label="Budget total (DH)" type="number" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} />

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <Button type="submit">
              {itineraireAModifier ? "Enregistrer les modifications" : "Créer l'itinéraire"}
            </Button>
            {itineraireAModifier && (
              <Button type="button" variant="secondary" onClick={onAnnulerModification}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateItinerary;