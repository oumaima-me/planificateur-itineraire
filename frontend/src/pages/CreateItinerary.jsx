import { useState, useEffect } from "react";
import api from "../api/axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function extractValue(eventOrValue) {
  if (typeof eventOrValue === "string" || typeof eventOrValue === "number") {
    return String(eventOrValue);
  }
  return eventOrValue?.target?.value ?? "";
}

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

function buildDefaultTitle(destinationText, dateDebut, dateFin) {
  const cleanDest = destinationText.trim();
  if (!cleanDest) return "Nouvel itinéraire";
  const startLabel = dateDebut ? formatDateDDMMYYYY(dateDebut) : "";
  const endLabel = dateFin ? formatDateDDMMYYYY(dateFin) : "";
  if (startLabel && endLabel) {
    return `${cleanDest} (${startLabel} → ${endLabel})`;
  }
  if (startLabel) {
    return `${cleanDest} (dès ${startLabel})`;
  }
  return `Voyage : ${cleanDest}`;
}

function CreateItinerary({
  itineraireAEditer = null,
  onSave,
  onCreate,
  onItineraryCreated,
  onAnnuler,
  onCancel,
}) {
  const [titre, setTitre] = useState("");
  const [destination, setDestination] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itineraireAEditer) {
      setTitre(itineraireAEditer.titre || "");
      setDestination(itineraireAEditer.destination || "");
      setDateDebut(
        (itineraireAEditer.date_debut || itineraireAEditer.dateDebut || "").slice(0, 10)
      );
      setDateFin(
        (itineraireAEditer.date_fin || itineraireAEditer.dateFin || "").slice(0, 10)
      );
      setBudget(
        itineraireAEditer.budget !== undefined && itineraireAEditer.budget !== null
          ? String(itineraireAEditer.budget)
          : ""
      );
      setDescription(itineraireAEditer.description || "");
    } else {
      setTitre("");
      setDestination("");
      setDateDebut("");
      setDateFin("");
      setBudget("");
      setDescription("");
    }
    setErreur("");
  }, [itineraireAEditer]);

  const handleCancel = onAnnuler || onCancel;

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    if (!destination.trim()) {
      setErreur(
        "Veuillez renseigner la destination ou le trajet (ex. : Sud ou Hiver 2026)."
      );
      return;
    }

    if (dateDebut && dateFin && dateFin < dateDebut) {
      setErreur("La date de fin doit être postérieure ou égale à la date de début.");
      return;
    }

    const finalTitle =
      titre.trim() || buildDefaultTitle(destination, dateDebut, dateFin);

    const payload = {
      titre: finalTitle,
      destination: destination.trim(),
      date_debut: dateDebut || null,
      date_fin: dateFin || null,
      budget: budget !== "" ? Number(budget) : 0,
      description: description.trim() || null,
    };

    setLoading(true);
    try {
      const response = itineraireAEditer?.id
        ? await api.put(`/itineraries/${itineraireAEditer.id}`, payload)
        : await api.post("/itineraries", payload);

      const savedItinerary = response.data?.data || response.data;
      const notifyParent = onSave || onCreate || onItineraryCreated;
      notifyParent?.(savedItinerary);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat()[0]
        : null;

      setErreur(
        firstValidationError ||
          error.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'itinéraire."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container create-itinerary">
      <div className="page-header">
        <div>
          <h2>
            {itineraireAEditer?.id ? "Modifier l'itinéraire" : "Nouvel itinéraire"}
          </h2>
          <p>
            {itineraireAEditer?.id
              ? "Mettez à jour les informations de votre voyage"
              : "Saisissez une destination ou un trajet (ex. : Agadir → Marrakech). Le titre est généré automatiquement s'il est laissé vide."}
          </p>
        </div>
      </div>

      {erreur && <p className="error-message">{erreur}</p>}

      <Card>
        <form onSubmit={handleSubmit} className="itinerary-form">
          <Input
            label="Destination ou trajet *"
            type="text"
            placeholder="Ex : Chefchaouen ou Agadir → Marrakech"
            value={destination}
            onChange={(val) => setDestination(extractValue(val))}
          />

          <Input
            label="Titre de l'itinéraire (optionnel)"
            type="text"
            placeholder="Ex : Escapade Sud (auto-généré si vide)"
            value={titre}
            onChange={(val) => setTitre(extractValue(val))}
          />

          <div className="form-grid-2">
            <Input
              label="Date de début"
              type="date"
              value={dateDebut}
              onChange={(val) => setDateDebut(extractValue(val))}
            />

            <Input
              label="Date de fin"
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(val) => setDateFin(extractValue(val))}
            />
          </div>

          <Input
            label="Budget prévisionnel (DH)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex : 3500"
            value={budget}
            onChange={(val) => setBudget(extractValue(val))}
          />

          <div className="input-group">
            <label htmlFor="itinerary-description">Description (optionnel)</label>
            <textarea
              id="itinerary-description"
              rows="3"
              placeholder="Notes, objectifs du voyage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions-end">
            {handleCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading
                ? "Enregistrement..."
                : itineraireAEditer?.id
                ? "Enregistrer les modifications"
                : "Créer l'itinéraire"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateItinerary;