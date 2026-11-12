import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

function StageCard({ etape, onModifierEtape, onSupprimerEtape, onAjouterActivite, onAjouterHebergement }) {
  const [enModeEdition, setEnModeEdition] = useState(false);
  const [ville, setVille] = useState(etape.ville);
  const [date, setDate] = useState(etape.date);

  const [nomActivite, setNomActivite] = useState("");
  const [coutActivite, setCoutActivite] = useState("");

  const [nomHebergement, setNomHebergement] = useState(etape.hebergement?.nom || "");
  const [prixParNuit, setPrixParNuit] = useState(etape.hebergement?.prixParNuit || "");
  const [nombreNuits, setNombreNuits] = useState(etape.hebergement?.nombreNuits || "");

  function handleSaveEdition(e) {
    e.preventDefault();
    onModifierEtape(etape.id, { ...etape, ville, date });
    setEnModeEdition(false);
  }

  function ajouterActivite(e) {
    e.preventDefault();
    if (!nomActivite || coutActivite === "") return;
    const activite = {
      id: Date.now(),
      nom: nomActivite,
      cout: Number(coutActivite),
    };
    onAjouterActivite(etape.id, activite);
    setNomActivite("");
    setCoutActivite("");
  }

  function soumettreHebergement(e) {
    e.preventDefault();
    if (!nomHebergement || prixParNuit === "" || nombreNuits === "") return;
    const hebergement = {
      nom: nomHebergement,
      prixParNuit: Number(prixParNuit),
      nombreNuits: Number(nombreNuits),
    };
    onAjouterHebergement(etape.id, hebergement);
  }

  return (
    <div className="stage-card" style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "8px" }}>
      {!enModeEdition ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Étape {etape.ordre} : {etape.ville}</h3>
            <p>Date : {etape.date}</p>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => setEnModeEdition(true)} title="Modifier l'étape"><Edit size={16} /></button>
            <button onClick={() => onSupprimerEtape(etape.id)} title="Supprimer l'étape" style={{ color: "red" }}><Trash2 size={16} /></button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveEdition}>
          <h4>Modifier l'étape</h4>
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setEnModeEdition(false)}>Annuler</button>
        </form>
      )}

      <hr />
      <h4>Activités</h4>
      {etape.activites?.length > 0 ? (
        etape.activites.map((act) => (
          <p key={act.id}>- {act.nom} : {act.cout} DH</p>
        ))
      ) : (
        <p>Aucune activité.</p>
      )}

      <form onSubmit={ajouterActivite} style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
        <input type="text" placeholder="Nom activité" value={nomActivite} onChange={(e) => setNomActivite(e.target.value)} />
        <input type="number" placeholder="Coût (DH)" value={coutActivite} onChange={(e) => setCoutActivite(e.target.value)} min="0" />
        <button type="submit">Ajouter</button>
      </form>

      <hr />
      <h4>Hébergement</h4>
      {etape.hebergement ? (
        <p>{etape.hebergement.nom} - {etape.hebergement.prixParNuit} DH/nuit × {etape.hebergement.nombreNuits} nuits</p>
      ) : (
        <p>Aucun hébergement.</p>
      )}

      <form onSubmit={soumettreHebergement} style={{ display: "flex", gap: "5px", marginTop: "5px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Nom hébergement" value={nomHebergement} onChange={(e) => setNomHebergement(e.target.value)} />
        <input type="number" placeholder="Prix/nuit" value={prixParNuit} onChange={(e) => setPrixParNuit(e.target.value)} min="0" />
        <input type="number" placeholder="Nuits" value={nombreNuits} onChange={(e) => setNombreNuits(e.target.value)} min="1" />
        <button type="submit">Enregistrer l'hébergement</button>
      </form>
    </div>
  );
}

export default StageCard;