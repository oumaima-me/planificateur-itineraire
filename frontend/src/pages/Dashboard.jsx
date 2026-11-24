import { useMemo } from "react";

function getRefDate(itinerary) {
  const raw =
    itinerary.dateDebut ||
    itinerary.date_debut ||
    itinerary.dateFin ||
    itinerary.date_fin;
  return raw ? String(raw).slice(0, 10) : null;
}

function formatDateDDMMYYYY(value, fallback = "Non définie") {
  if (!value) return fallback;
  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
}

function Dashboard({
  itineraires = [],
  completedItineraryIds = [],
  utilisateur,
  onNavigate,
  onNouvelItineraire,
  onOuvrirDetails,
  onVoirDetails,
  onModifierItineraire,
  onModifier,
  onSupprimer,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const handleOpenCreate = () => {
    if (onNouvelItineraire) {
      onNouvelItineraire();
      return;
    }
    onNavigate?.("creation");
  };

  const handleOpenDetails = (item) => {
    if (onOuvrirDetails) {
      onOuvrirDetails(item);
      return;
    }
    onVoirDetails?.(item);
  };

  const handleEdit = (item) => {
    if (onModifierItineraire) {
      onModifierItineraire(item);
      return;
    }
    onModifier?.(item);
  };

  const { futurs, passes, budgetTotal } = useMemo(() => {
    const upcoming = [];
    const past = [];
    let totalBudget = 0;

    for (const item of itineraires) {
      totalBudget += Number(item.budgetTotal ?? item.budget ?? 0) || 0;
      const refDate = getRefDate(item);
      if (!refDate || refDate >= today) {
        upcoming.push(item);
      } else {
        past.push(item);
      }
    }

    upcoming.sort((a, b) => {
      const da = getRefDate(a);
      const db = getRefDate(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

    past.sort((a, b) => {
      const da = getRefDate(a) || "";
      const db = getRefDate(b) || "";
      return db.localeCompare(da);
    });

    return {
      futurs: upcoming,
      passes: past,
      budgetTotal: totalBudget,
    };
  }, [itineraires, today]);

  const orderedItineraries = [...futurs, ...passes];

  function renderItineraryCard(item) {
    const refDate = getRefDate(item);
    const isPast = Boolean(refDate && refDate < today);
    const isCompleted = completedItineraryIds.includes(Number(item.id));
    const steps = item.steps || item.etapes || [];
    const obligatoireStepsCount = steps.filter((s) =>
      Boolean(s.estObligatoire ?? s.est_obligatoire)
    ).length;

    const rawStart = item.dateDebut || item.date_debut;
    const rawEnd = item.dateFin || item.date_fin;

    return (
      <div key={item.id} className="itinerary-card">
        <div className="itinerary-card-header">
          <div>
            <h3>{item.titre}</h3>
            <p className="itinerary-destination">{item.destination}</p>
          </div>
          <div className="badge-group">
            {isCompleted && <span className="badge-termine">Planning terminé</span>}
            <span className={isPast ? "badge-passe" : "badge-futur"}>
              {isPast ? "Passé" : "À venir"}
            </span>
          </div>
        </div>

        <p className="itinerary-dates">
          Dates : {formatDateDDMMYYYY(rawStart, "Non définie")} →{" "}
          {formatDateDDMMYYYY(rawEnd, "Non définie")}
        </p>

        <p className="itinerary-meta">
          Budget : {Number(item.budgetTotal ?? item.budget ?? 0).toFixed(2)} DH · Étapes :{" "}
          {steps.length} ({obligatoireStepsCount} obligatoire(s))
        </p>

        <div className="itinerary-actions">
          <button type="button" onClick={() => handleOpenDetails(item)}>
            Détails & Étapes
          </button>
          <button type="button" onClick={() => handleEdit(item)}>
            Modifier
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={() => onSupprimer?.(item.id)}
          >
            Supprimer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <h2>Bonjour, {utilisateur?.nom || utilisateur?.name}</h2>
          <p>
            Ouvrez un itinéraire pour gérer ses étapes et consulter son résumé & timeline.
          </p>
        </div>
      </section>

      <section className="dashboard-stats">
        <div className="stat-box">
          <span>Total itinéraires</span>
          <strong>{itineraires.length}</strong>
        </div>
        <div className="stat-box">
          <span>À venir</span>
          <strong>{futurs.length}</strong>
        </div>
        <div className="stat-box">
          <span>Passés</span>
          <strong>{passes.length}</strong>
        </div>
        <div className="stat-box">
          <span>Budget cumulé</span>
          <strong>{budgetTotal.toFixed(2)} DH</strong>
        </div>
      </section>

      {orderedItineraries.length === 0 ? (
        <div className="empty-state">
          <p>Aucun itinéraire enregistré pour le moment.</p>
          <button type="button" onClick={handleOpenCreate}>
            Créer mon premier itinéraire
          </button>
        </div>
      ) : (
        <>
          <section className="itineraries-section">
            <h3>Itinéraires à venir ({futurs.length})</h3>
            {futurs.length === 0 ? (
              <p className="empty-hint">Aucun itinéraire futur planifié.</p>
            ) : (
              <div className="itineraries-list">{futurs.map(renderItineraryCard)}</div>
            )}
          </section>

          <section className="itineraries-section">
            <h3>Itinéraires passés ({passes.length})</h3>
            {passes.length === 0 ? (
              <p className="empty-hint">Aucun itinéraire passé.</p>
            ) : (
              <div className="itineraries-list">{passes.map(renderItineraryCard)}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;