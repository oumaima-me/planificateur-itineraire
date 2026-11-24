import { useState, useEffect, useCallback } from "react";
import {
  BedDouble,
  MapPinned,
  Eye,
  Pencil,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

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

function ItineraryDetails({
  itineraire,
  isPlanningCompleted = false,
  onModifierItineraire,
  onRetour,
  onTerminerPlanning,
}) {
  const [details, setDetails] = useState(itineraire);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [modeEdition, setModeEdition] = useState(true);

  const [stepNom, setStepNom] = useState("");
  const [stepNotes, setStepNotes] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [stepObligatoire, setStepObligatoire] = useState(false);

  const [activityForms, setActivityForms] = useState({});
  const [hebergementForms, setHebergementForms] = useState({});

  const refreshDetails = useCallback(async () => {
    if (!itineraire?.id) return;
    setLoading(true);
    setErreur("");
    try {
      const response = await api.get(`/itineraries/${itineraire.id}`);
      const updated = response.data?.data || response.data;
      setDetails(updated);
      onModifierItineraire?.(updated);
    } catch (error) {
      console.error("Erreur chargement détails :", error);
      setErreur("Impossible de charger les détails de l'itinéraire.");
    } finally {
      setLoading(false);
    }
  }, [itineraire?.id, onModifierItineraire]);

  useEffect(() => {
    setDetails(itineraire);
    if (itineraire?.id) {
      refreshDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraire?.id]);

  if (!details) {
    return (
      <div className="details-page">
        <div className="card">
          <p>Aucun itinéraire sélectionné.</p>
          {onRetour && (
            <button type="button" className="button-secondary" onClick={onRetour}>
              <ArrowLeft size={16} /> Retour à Mes itinéraires
            </button>
          )}
        </div>
      </div>
    );
  }

  const steps = [...(details.steps || details.etapes || [])].sort(
    (a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0)
  );

  function getActivities(step) {
    return step.activities || step.activites || [];
  }

  function getHebergements(step) {
    return step.accommodations || step.hebergements || [];
  }

  function coutHebergement(h) {
    return (Number(h.prix_par_nuit) || 0) * (Number(h.nombre_nuits) || 0);
  }

  async function handleAddStep(e) {
    e.preventDefault();
    if (!stepNom.trim()) return;

    setErreur("");
    try {
      await api.post("/steps", {
        itinerary_id: details.id,
        nom: stepNom.trim(),
        notes: stepNotes.trim() || null,
        date_etape: stepDate || null,
        ordre: steps.length + 1,
        est_obligatoire: Boolean(stepObligatoire),
      });

      setStepNom("");
      setStepNotes("");
      setStepDate("");
      setStepObligatoire(false);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'ajout de l'étape.");
    }
  }

  async function handleToggleStepObligatoire(step) {
    setErreur("");
    try {
      await api.put(`/steps/${step.id}`, {
        est_obligatoire: !Boolean(step.est_obligatoire ?? step.estObligatoire),
      });
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la mise à jour de l'étape.");
    }
  }

  async function handleDeleteStep(step) {
    if (step.est_obligatoire || step.estObligatoire) {
      setErreur("Une étape obligatoire ne peut pas être supprimée.");
      return;
    }

    setErreur("");
    try {
      await api.delete(`/steps/${step.id}`);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la suppression de l'étape.");
    }
  }

  function getActivityForm(stepId) {
    return activityForms[stepId] || { nom: "", cout: "0", est_obligatoire: false };
  }

  function updateActivityForm(stepId, patch) {
    setActivityForms((prev) => ({
      ...prev,
      [stepId]: { ...getActivityForm(stepId), ...patch },
    }));
  }

  async function handleAddActivity(e, stepId, currentActivitiesCount) {
    e.preventDefault();
    const form = getActivityForm(stepId);
    if (!form.nom.trim()) return;

    setErreur("");
    try {
      await api.post("/activities", {
        step_id: stepId,
        nom: form.nom.trim(),
        cout: Number(form.cout) || 0,
        est_obligatoire: Boolean(form.est_obligatoire),
        ordre: currentActivitiesCount + 1,
      });

      updateActivityForm(stepId, { nom: "", cout: "0", est_obligatoire: false });
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'ajout de l'activité.");
    }
  }

  async function handleToggleActivityObligatoire(activity) {
    setErreur("");
    try {
      await api.put(`/activities/${activity.id}`, {
        est_obligatoire: !Boolean(activity.est_obligatoire),
      });
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la mise à jour de l'activité.");
    }
  }

  async function handleDeleteActivity(activity) {
    if (activity.est_obligatoire) {
      setErreur("Une activité obligatoire ne peut pas être supprimée.");
      return;
    }

    setErreur("");
    try {
      await api.delete(`/activities/${activity.id}`);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la suppression de l'activité.");
    }
  }

  function getHebergementForm(stepId) {
    return hebergementForms[stepId] || { nom: "", prix_par_nuit: "", nombre_nuits: "1" };
  }

  function updateHebergementForm(stepId, patch) {
    setHebergementForms((prev) => ({
      ...prev,
      [stepId]: { ...getHebergementForm(stepId), ...patch },
    }));
  }

  async function handleAddHebergement(e, stepId) {
    e.preventDefault();
    const form = getHebergementForm(stepId);
    if (!form.nom.trim() || form.prix_par_nuit === "" || form.nombre_nuits === "") return;

    setErreur("");
    try {
      await api.post("/accommodations", {
        step_id: stepId,
        nom: form.nom.trim(),
        prix_par_nuit: Number(form.prix_par_nuit) || 0,
        nombre_nuits: Number(form.nombre_nuits) || 1,
      });

      updateHebergementForm(stepId, { nom: "", prix_par_nuit: "", nombre_nuits: "1" });
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'ajout de l'hébergement.");
    }
  }

  async function handleDeleteHebergement(hebergement) {
    setErreur("");
    try {
      await api.delete(`/accommodations/${hebergement.id}`);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la suppression de l'hébergement.");
    }
  }

  const totalActivitiesCost = steps.reduce((sum, step) => {
    const acts = getActivities(step);
    return sum + acts.reduce((aSum, act) => aSum + (Number(act.cout) || 0), 0);
  }, 0);

  const totalHebergementCost = steps.reduce(
    (sum, step) =>
      sum + getHebergements(step).reduce((hSum, h) => hSum + coutHebergement(h), 0),
    0
  );

  const budget = Number(details.budget ?? details.budgetTotal ?? 0);
  const totalDepenses = totalActivitiesCost + totalHebergementCost;
  const reste = budget - totalDepenses;

  const formattedStart = formatDateDDMMYYYY(
    details.date_debut || details.dateDebut,
    "—"
  );
  const formattedEnd = formatDateDDMMYYYY(
    details.date_fin || details.dateFin,
    "—"
  );

  return (
    <div className="details-page">
      <div className="details-header">
        <div className="details-title-row">
          <h2>{details.titre}</h2>
          {isPlanningCompleted && (
            <span className="badge-termine">
              <CheckCircle2 size={13} /> Planning terminé
            </span>
          )}
        </div>
        <p>
          Destination : <strong>{details.destination}</strong> · Dates :{" "}
          {formattedStart} → {formattedEnd}
        </p>
        <p>
          Budget : <strong>{budget.toFixed(2)} DH</strong> · Activités :{" "}
          <strong>{totalActivitiesCost.toFixed(2)} DH</strong> · Hébergements :{" "}
          <strong>{totalHebergementCost.toFixed(2)} DH</strong> · Reste :{" "}
          <strong>{reste.toFixed(2)} DH</strong>
        </p>
        {details.description && <p>{details.description}</p>}

        <div className="details-toolbar">
          {onRetour && (
            <button type="button" className="button-secondary" onClick={onRetour}>
              <ArrowLeft size={16} /> Mes itinéraires
            </button>
          )}
          <button
            type="button"
            className={!modeEdition ? "button-primary" : "button-secondary"}
            onClick={() => setModeEdition((prev) => !prev)}
          >
            {modeEdition ? (
              <>
                <Eye size={16} /> Vue organisée
              </>
            ) : (
              <>
                <Pencil size={16} /> Mode édition
              </>
            )}
          </button>
          <button type="button" onClick={refreshDetails} disabled={loading}>
            <RefreshCw size={15} /> {loading ? "Actualisation..." : "Actualiser"}
          </button>
          {onTerminerPlanning && (
            <button
              type="button"
              className="button-primary"
              onClick={() => onTerminerPlanning(details)}
            >
              <CheckCircle2 size={16} /> Terminer le planning
            </button>
          )}
        </div>
      </div>

      {erreur && <p className="error-message">{erreur}</p>}

      {modeEdition && (
        <section className="add-step-section">
          <h3>Ajouter une étape</h3>
          <small className="field-helper">
            Une étape est une ville, un lieu d'arrêt ou un jour de parcours (ex. : Ouarzazate ou Jour 2 - Vallée du Dadès).
          </small>
          <form onSubmit={handleAddStep} className="step-form">
            <input
              type="text"
              placeholder="Étape (ville, lieu d'arrêt ou jour)"
              value={stepNom}
              onChange={(e) => setStepNom(e.target.value)}
            />
            <input type="date" value={stepDate} onChange={(e) => setStepDate(e.target.value)} />
            <input
              type="text"
              placeholder="Notes (optionnel)"
              value={stepNotes}
              onChange={(e) => setStepNotes(e.target.value)}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={stepObligatoire}
                onChange={(e) => setStepObligatoire(e.target.checked)}
              />
              Étape obligatoire
            </label>
            <button type="submit">Ajouter l'étape</button>
          </form>
        </section>
      )}

      <section className="steps-section">
        <h3>
          Programme détaillé ({steps.length} étape{steps.length > 1 ? "s" : ""})
        </h3>
        {steps.length === 0 ? (
          <p className="empty-hint">Aucune étape pour cet itinéraire.</p>
        ) : (
          steps.map((step, index) => {
            const isObligatoire = Boolean(step.est_obligatoire ?? step.estObligatoire);
            const activities = getActivities(step);
            const hebergements = getHebergements(step);
            const actForm = getActivityForm(step.id);
            const hebForm = getHebergementForm(step.id);
            const coutHebergementEtape = hebergements.reduce(
              (s, h) => s + coutHebergement(h),
              0
            );
            const coutActivitesEtape = activities.reduce(
              (s, a) => s + (Number(a.cout) || 0),
              0
            );

            return (
              <div key={step.id} className="step-card">
                <div className="step-header">
                  <div>
                    <strong>
                      {index + 1}. {step.nom}
                    </strong>
                    {step.date_etape && (
                      <span className="step-date">
                        {" "}
                        — {formatDateDDMMYYYY(step.date_etape)}
                      </span>
                    )}
                    <span
                      className={isObligatoire ? "badge-obligatoire" : "badge-facultatif"}
                    >
                      {isObligatoire ? "Obligatoire par défaut" : "Facultatif"}
                    </span>
                  </div>

                  {modeEdition && (
                    <div className="step-actions">
                      <button
                        type="button"
                        onClick={() => handleToggleStepObligatoire(step)}
                      >
                        {isObligatoire ? "Passer facultatif" : "Rendre obligatoire"}
                      </button>
                      <button
                        type="button"
                        className="button-danger"
                        disabled={isObligatoire}
                        onClick={() => handleDeleteStep(step)}
                      >
                        Supprimer étape
                      </button>
                    </div>
                  )}
                </div>

                {step.notes && <p className="step-notes">{step.notes}</p>}

                <div className="activities-block">
                  <h4>
                    <MapPinned size={16} /> Activités ({activities.length})
                    {activities.length > 0 && (
                      <small> — {coutActivitesEtape.toFixed(2)} DH</small>
                    )}
                  </h4>
                  <small className="field-helper">
                    Une activité est ce que vous faites sur place : visite, musée, balade, repas ou excursion.
                  </small>
                  {activities.length === 0 ? (
                    <p className="empty-hint">Aucune activité dans cette étape.</p>
                  ) : (
                    <ul className="activities-list">
                      {activities.map((act) => {
                        const actObligatoire = Boolean(act.est_obligatoire);
                        return (
                          <li key={act.id} className="activity-item">
                            <span>
                              <strong>{act.nom}</strong> —{" "}
                              {Number(act.cout || 0).toFixed(2)} DH{" "}
                              <span
                                className={
                                  actObligatoire ? "badge-obligatoire" : "badge-facultatif"
                                }
                              >
                                {actObligatoire ? "Obligatoire" : "Facultatif"}
                              </span>
                            </span>

                            {modeEdition && (
                              <div className="activity-actions">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActivityObligatoire(act)}
                                >
                                  {actObligatoire ? "Facultatif" : "Obligatoire"}
                                </button>
                                <button
                                  type="button"
                                  className="button-danger"
                                  disabled={actObligatoire}
                                  onClick={() => handleDeleteActivity(act)}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {modeEdition && (
                    <form
                      onSubmit={(e) => handleAddActivity(e, step.id, activities.length)}
                      className="activity-form"
                    >
                      <input
                        type="text"
                        placeholder="Activité (ex. : visite, déjeuner, randonnée)"
                        value={actForm.nom}
                        onChange={(e) =>
                          updateActivityForm(step.id, { nom: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Coût (DH)"
                        value={actForm.cout}
                        onChange={(e) =>
                          updateActivityForm(step.id, { cout: e.target.value })
                        }
                      />
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={Boolean(actForm.est_obligatoire)}
                          onChange={(e) =>
                            updateActivityForm(step.id, {
                              est_obligatoire: e.target.checked,
                            })
                          }
                        />
                        Obligatoire
                      </label>
                      <button type="submit">+ Activité</button>
                    </form>
                  )}
                </div>

                <div className="hebergement-block">
                  <h4>
                    <BedDouble size={16} /> Hébergement ({hebergements.length})
                  </h4>
                  {hebergements.length === 0 ? (
                    <p className="empty-hint">Aucun hébergement pour cette étape.</p>
                  ) : (
                    <>
                      <ul className="hebergement-list">
                        {hebergements.map((h) => (
                          <li key={h.id} className="hebergement-item">
                            <span>
                              <strong>{h.nom}</strong>
                              <span className="hebergement-detail">
                                {Number(h.prix_par_nuit || 0).toFixed(2)} DH/nuit ×{" "}
                                {h.nombre_nuits} nuit(s) = {coutHebergement(h).toFixed(2)} DH
                              </span>
                            </span>
                            {modeEdition && (
                              <button
                                type="button"
                                className="button-danger"
                                onClick={() => handleDeleteHebergement(h)}
                              >
                                Supprimer
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      <p className="hebergement-total">
                        Total hébergement de l'étape : {coutHebergementEtape.toFixed(2)} DH
                      </p>
                    </>
                  )}

                  {modeEdition && (
                    <form
                      onSubmit={(e) => handleAddHebergement(e, step.id)}
                      className="hebergement-form"
                    >
                      <input
                        type="text"
                        placeholder="Nom (hôtel, riad, auberge...)"
                        value={hebForm.nom}
                        onChange={(e) =>
                          updateHebergementForm(step.id, { nom: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Prix / nuit (DH)"
                        value={hebForm.prix_par_nuit}
                        onChange={(e) =>
                          updateHebergementForm(step.id, {
                            prix_par_nuit: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Nuits"
                        value={hebForm.nombre_nuits}
                        onChange={(e) =>
                          updateHebergementForm(step.id, {
                            nombre_nuits: e.target.value,
                          })
                        }
                      />
                      <button type="submit">+ Hébergement</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default ItineraryDetails;