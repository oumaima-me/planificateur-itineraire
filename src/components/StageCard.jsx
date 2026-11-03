
function StageCard({ etape }) {
  return (
    <div className="stage-card">
      <h3>Étape {etape.ordre} : {etape.ville}</h3>

      <p>Date : {etape.date}</p>

      <h4>Activités</h4>

      {etape.activites.map((activite) => (
        <p key={activite.id}>
          {activite.nom} - {activite.cout} DH
        </p>
      ))}

      <h4>Hébergement</h4>

      {etape.hebergement ? (
        <p>
          {etape.hebergement.nom} -
          {etape.hebergement.prixParNuit} DH / nuit
        </p>
      ) : (
        <p>Aucun hébergement ajouté</p>
      )}
    </div>
  );
}

export default StageCard;
