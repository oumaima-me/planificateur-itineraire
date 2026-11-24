import { useState, useMemo } from "react";
import { Plus, Eye, Pencil, Trash2, MapPin, Calendar, Wallet } from "lucide-react";
import ItineraryDateFilter, {
  filterItinerariesByDate,
} from "../components/ItineraryDateFilter";

function formatDateDDMMYYYY(value, fallback = "—") {
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

function MyItineraries({
  itineraires = [],
  completedItineraryIds = [],
  onNouvelItineraire,
  onVoirDetails,
  onModifier,
  onSupprimer,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const itinerairesFiltres = useMemo(
    () => filterItinerariesByDate(itineraires, startDate, endDate),
    [itineraires, startDate, endDate]
  );

  const hasActiveFilter = Boolean(startDate || endDate);

  return (
    <div className="page-container my-itineraries">
      <div className="page-header">
        <div>
          <h2>Mes itinéraires</h2>
          <p>Sélectionnez un itinéraire pour ouvrir ses détails et son résumé</p>
        </div>
      </div>

      <ItineraryDateFilter
        itineraries={itineraires}
        startDate={startDate}
        endDate={endDate}
        onFilterChange={(_, dates) => {
          setStartDate(dates.startDate);
          setEndDate(dates.endDate);
        }}
      />

      {itinerairesFiltres.length === 0 ? (
        <div className="card empty-state">
          {hasActiveFilter ? (
            <>
              <p>Aucun itinéraire ne correspond aux dates sélectionnées.</p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Réinitialiser le filtre
              </button>
            </>
          ) : (
            <>
              <p>Vous n'avez encore créé aucun itinéraire.</p>
              <button type="button" className="button-primary" onClick={onNouvelItineraire}>
                <Plus size={16} /> Créer mon premier itinéraire
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="itineraries-grid">
          {itinerairesFiltres.map((item) => {
            const budget = Number(item.budget ?? item.budgetTotal ?? 0);
            const dateDebut = formatDateDDMMYYYY(item.date_debut || item.dateDebut, "—");
            const dateFin = formatDateDDMMYYYY(item.date_fin || item.dateFin, "—");
            const stepsCount = (item.steps || item.etapes || []).length;
            const isCompleted = completedItineraryIds.includes(Number(item.id));

            return (
              <div key={item.id} className="itinerary-card">
                <div className="itinerary-card-header">
                  <h3>{item.titre}</h3>
                  <div className="badge-group">
                    {isCompleted && <span className="badge-termine">Terminé</span>}
                    <span className="steps-pill">
                      {stepsCount} étape{stepsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="itinerary-card-meta">
                  <p>
                    <MapPin size={15} /> <strong>{item.destination}</strong>
                  </p>
                  <p>
                    <Calendar size={15} /> {dateDebut} → {dateFin}
                  </p>
                  <p>
                    <Wallet size={15} /> Budget : <strong>{budget.toFixed(2)} DH</strong>
                  </p>
                </div>

                {item.description && (
                  <p className="itinerary-card-description">{item.description}</p>
                )}

                <div className="itinerary-card-actions">
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => onVoirDetails?.(item)}
                  >
                    <Eye size={15} /> Ouvrir les détails
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => onModifier?.(item)}
                  >
                    <Pencil size={15} /> Modifier
                  </button>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => onSupprimer?.(item.id)}
                  >
                    <Trash2 size={15} /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyItineraries;