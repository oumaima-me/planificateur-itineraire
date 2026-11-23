import { useState, useEffect, useCallback } from "react";
import {
  BedDouble,
  MapPinned,
  Eye,
  Pencil,
  RefreshCw,
  ArrowLeft,
  Route,
} from "lucide-react";
import api from "../api/axios";

function ItineraryDetails({ itineraire, onModifierItineraire, onRetour, onVoirResume }) {
  const [details, setDetails] = useState(itineraire);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [modeEdition, setModeEdition] = useState(true);

  // Formulaire ajout d'étape
  const [stepNom, setStepNom] = useState("");
  const [stepNotes, setStepNotes] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [stepObligatoire, setStepObligatoire] = useState(false);

  // Formulaires par étape : { [stepId]: {...} }
  const [activityForms, setActivityForms] = useState({});
  const [hebergementForms, setHebergementForms] = useState({});

  const refreshDetails = useCallback(async () => {
    if (!itineraire?.id) return;
    setLoading(true);
    setErreur("");
    try {
      const response = await api.get(`/itineraries/${itineraire.id}`);
      setDetails(response.data);
      onModifierItineraire?.(response.data);
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
              <ArrowLeft size={16} /> Retour
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

  /* ---------- Étapes ---------- */
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

  /* ---------- Activités ---------- */
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

  /* ---------- Hébergements ---------- */
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

  /* ---------- Totaux ---------- */
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

  return (
    <div className="details-page">
      <div className="details-header">
        <h2>{details.titre}</h2>
        <p>
          Destination : <strong>{details.destination}</strong> | Dates :{" "}
          {details.date_debut || details.dateDebut || "—"} →{" "}
          {details.date_fin || details.dateFin || "—"}
        </p>
        <p>
          Budget : <strong>{budget.toFixed(2)} DH</strong> | Activités :{" "}
          <strong>{totalActivitiesCost.toFixed(2)} DH</strong> | Hébergements :{" "}
          <strong>{totalHebergementCost.toFixed(2)} DH</strong> | Reste :{" "}
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
          {onVoirResume && (
            <button
              type="button"
              className="button-primary"
              onClick={() => onVoirResume(details)}
            >
              <Route size={16} /> Terminer le planning & Résumé
            </button>
          )}
        </div>
      </div>

      {erreur && <p className="error-message">{erreur}</p>}

      {modeEdition && (
        <section className="add-step-section">
          <h3>Ajouter une étape</h3>
          <form onSubmit={handleAddStep} className="step-form">
            <input
              type="text"
              placeholder="Nom de l'étape"
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
                      <span className="step-date"> — {step.date_etape}</span>
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

                {/* ---------- Activités ---------- */}
                <div className="activities-block">
                  <h4>
                    <MapPinned size={16} /> Activités ({activities.length})
                    {activities.length > 0 && (
                      <small> — {coutActivitesEtape.toFixed(2)} DH</small>
                    )}
                  </h4>
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
                        placeholder="Nouvelle activité"
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

                {/* ---------- Hébergement ---------- */}
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