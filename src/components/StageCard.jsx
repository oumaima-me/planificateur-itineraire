import { useState } from "react";

function StageCard({ etape, onAjouterActivite, onAjouterHebergement }) {
  const [nomActivite, setNomActivite] = useState("");
  const [coutActivite, setCoutActivite] = useState("");

  const [nomHebergement, setNomHebergement] = useState("");
  const [prixParNuit, setPrixParNuit] = useState("");
  const [nombreNuits, setNombreNuits] = useState("");

  function ajouterActivite(e) {
    e.preventDefault();

    if (!nomActivite || coutActivite === "") {
      return;
    }

    const activite = {
      id: Date.now(),
      nom: nomActivite,
      cout: Number(coutActivite),
    };

    onAjouterActivite(etape.id, activite);

    setNomActivite("");
    setCoutActivite("");
  }

  function ajouterHebergement(e) {
    e.preventDefault();

    if (!nomHebergement || prixParNuit === "" || nombreNuits === "") {
      return;
    }

    const hebergement = {
      nom: nomHebergement,
      prixParNuit: Number(prixParNuit),
      nombreNuits: Number(nombreNuits),
    };

    onAjouterHebergement(etape.id, hebergement);

    setNomHebergement("");
    setPrixParNuit("");
    setNombreNuits("");
  }

  return (
    <div className="stage-card">
      <h3>Étape {etape.ordre} : {etape.ville}</h3>
      <p>Date : {etape.date}</p>

      <h4>Activités</h4>

      {etape.activites.length > 0 ? (
        etape.activites.map((activite) => (
          <p key={activite.id}>
            {activite.nom} - {activite.cout} DH
          </p>
        ))
      ) : (
        <p>Aucune activité ajoutée.</p>
      )}

      <form onSubmit={ajouterActivite}>
        <input
          type="text"
          placeholder="Nom de l'activité"
          value={nomActivite}
          onChange={(e) => setNomActivite(e.target.value)}
        />

        <input
          type="number"
          placeholder="Coût en DH"
          min="0"
          value={coutActivite}
          onChange={(e) => setCoutActivite(e.target.value)}
        />

        <button type="submit">Ajouter une activité</button>
      </form>

      <h4>Hébergement</h4>

      {etape.hebergement ? (
        <p>
          {etape.hebergement.nom} -
          {" "}{etape.hebergement.prixParNuit} DH / nuit
          {" "}× {etape.hebergement.nombreNuits} nuits
        </p>
      ) : (
        <p>Aucun hébergement ajouté.</p>
      )}

      <form onSubmit={ajouterHebergement}>
        <input
          type="text"
          placeholder="Nom de l'hébergement"
          value={nomHebergement}
          onChange={(e) => setNomHebergement(e.target.value)}
        />

        <input
          type="number"
          placeholder="Prix par nuit (DH)"
          min="0"
          value={prixParNuit}
          onChange={(e) => setPrixParNuit(e.target.value)}
        />

        <input
          type="number"
          placeholder="Nombre de nuits"
          min="1"
          value={nombreNuits}
          onChange={(e) => setNombreNuits(e.target.value)}
        />

        <button type="submit">Ajouter l'hébergement</button>
      </form>
    </div>
  );
}

export default StageCard;