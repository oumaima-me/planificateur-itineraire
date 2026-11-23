import { useState, useMemo } from "react";
import { Calendar, RotateCcw } from "lucide-react";

function normalizeDateValue(raw) {
  if (!raw) return "";
  // Handles "YYYY-MM-DD" or ISO strings like "2026-12-10T00:00:00.000000Z"
  return String(raw).slice(0, 10);
}

export function filterItinerariesByDate(itineraries, startFilter, endFilter) {
  if (!Array.isArray(itineraries)) return [];
  if (!startFilter && !endFilter) return itineraries;

  return itineraries.filter((item) => {
    const itemStart = normalizeDateValue(item.date_debut || item.dateDebut);
    const itemEnd = normalizeDateValue(item.date_fin || item.dateFin) || itemStart;

    if (!itemStart && !itemEnd) return false;

    // If user specifies a start date: itinerary must start on/after it OR overlap with it
    if (startFilter) {
      const effectiveEnd = itemEnd || itemStart;
      if (effectiveEnd < startFilter) return false;
    }

    // If user specifies an end date: itinerary must start on/before it
    if (endFilter) {
      const effectiveStart = itemStart || itemEnd;
      if (effectiveStart > endFilter) return false;
    }

    return true;
  });
}

function ItineraryDateFilter({
  itineraries = [],
  onFilterChange,
  startDate: controlledStart,
  endDate: controlledEnd,
}) {
  const [internalStart, setInternalStart] = useState("");
  const [internalEnd, setInternalEnd] = useState("");

  const startDate = controlledStart !== undefined ? controlledStart : internalStart;
  const endDate = controlledEnd !== undefined ? controlledEnd : internalEnd;

  const filteredList = useMemo(
    () => filterItinerariesByDate(itineraries, startDate, endDate),
    [itineraries, startDate, endDate]
  );

  function applyDates(nextStart, nextEnd) {
    if (controlledStart === undefined) setInternalStart(nextStart);
    if (controlledEnd === undefined) setInternalEnd(nextEnd);
    const nextFiltered = filterItinerariesByDate(itineraries, nextStart, nextEnd);
    onFilterChange?.(nextFiltered, { startDate: nextStart, endDate: nextEnd });
  }

  function handleReset() {
    applyDates("", "");
  }

  const hasActiveFilter = Boolean(startDate || endDate);

  return (
    <div className="date-filter-bar">
      <div className="date-filter-title">
        <Calendar size={16} />
        <span>Filtrer par dates</span>
      </div>

      <div className="date-filter-inputs">
        <label className="date-filter-field">
          <span>Du</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => applyDates(e.target.value, endDate)}
          />
        </label>

        <label className="date-filter-field">
          <span>Au</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => applyDates(startDate, e.target.value)}
          />
        </label>

        {hasActiveFilter && (
          <button
            type="button"
            className="button-secondary date-filter-reset"
            onClick={handleReset}
          >
            <RotateCcw size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {hasActiveFilter && (
        <span className="date-filter-count">
          {filteredList.length} résultat{filteredList.length > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

export default ItineraryDateFilter;