import { useState, useEffect, useCallback } from "react";
import {
  BedDouble,
  MapPinned,
  Eye,
  Pencil,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
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

function toDateInputValue(value) {
  if (!value) return "";
  const raw = String(value).trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
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

  // Formulaire ajout étape
  const [stepNom, setStepNom] = useState("");
  const [stepNotes, setStepNotes] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [stepObligatoire, setStepObligatoire] = useState(false);

  // Édition étape
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepForm, setEditingStepForm] = useState({
    nom: "",
    date_etape: "",
    notes: "",
    est_obligatoire: false,
  });

  // Formulaires ajout activité / hébergement par stepId
  const [activityForms, setActivityForms] = useState({});
  const [hebergementForms, setHebergementForms] = useState({});

  // Édition activité
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editingActivityForm, setEditingActivityForm] = useState({
    nom: "",
    cout: "0",
    notes: "",
    est_obligatoire: false,
  });

  // Édition hébergement
  const [editingHebergementId, setEditingHebergementId] = useState(null);
  const [editingHebergementForm, setEditingHebergementForm] = useState({
    nom: "",
    prix_par_nuit: "0",
    nombre_nuits: "1",
  });

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
    setEditingStepId(null);
    setEditingActivityId(null);
    setEditingHebergementId(null);
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

  // --- ÉTAPES ---
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

  function startEditingStep(step) {
    setEditingStepId(step.id);
    setEditingStepForm({
      nom: step.nom || "",
      date_etape: toDateInputValue(step.date_etape || step.dateEtape),
      notes: step.notes || "",
      est_obligatoire: Boolean(step.est_obligatoire ?? step.estObligatoire),
    });
    setErreur("");
  }

  async function handleSaveStep(e, stepId) {
    e.preventDefault();
    if (!editingStepForm.nom.trim()) {
      setErreur("Le nom de l'étape est obligatoire.");
      return;
    }

    setErreur("");
    try {
      await api.put(`/steps/${stepId}`, {
        nom: editingStepForm.nom.trim(),
        date_etape: editingStepForm.date_etape || null,
        notes: editingStepForm.notes.trim() || null,
        est_obligatoire: Boolean(editingStepForm.est_obligatoire),
      });
      setEditingStepId(null);
      await refreshDetails();
    } catch (error) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la modification de l'étape."
      );
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
      if (editingStepId === step.id) setEditingStepId(null);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la suppression de l'étape.");
    }
  }

  // --- ACTIVITÉS ---
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

  function startEditingActivity(activity) {
    setEditingActivityId(activity.id);
    setEditingActivityForm({
      nom: activity.nom || "",
      cout:
        activity.cout !== undefined && activity.cout !== null
          ? String(activity.cout)
          : "0",
      notes: activity.notes || "",
      est_obligatoire: Boolean(activity.est_obligatoire),
    });
    setErreur("");
  }

  async function handleSaveActivity(e, activityId) {
    e.preventDefault();
    if (!editingActivityForm.nom.trim()) {
      setErreur("Le nom de l'activité est obligatoire.");
      return;
    }

    setErreur("");
    try {
      await api.put(`/activities/${activityId}`, {
        nom: editingActivityForm.nom.trim(),
        cout: Number(editingActivityForm.cout) || 0,
        notes: editingActivityForm.notes.trim() || null,
        est_obligatoire: Boolean(editingActivityForm.est_obligatoire),
      });
      setEditingActivityId(null);
      await refreshDetails();
    } catch (error) {
      setErreur(
        error.response?.data?.message || "Erreur lors de la modification de l'activité."
      );
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
      if (editingActivityId === activity.id) setEditingActivityId(null);
      await refreshDetails();
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de la suppression de l'activité.");
    }
  }

  // --- HÉBERGEMENTS ---
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

  function startEditingHebergement(hebergement) {
    setEditingHebergementId(hebergement.id);
    setEditingHebergementForm({
      nom: hebergement.nom || "",
      prix_par_nuit:
        hebergement.prix_par_nuit !== undefined && hebergement.prix_par_nuit !== null
          ? String(hebergement.prix_par_nuit)
          : "0",
      nombre_nuits:
        hebergement.nombre_nuits !== undefined && hebergement.nombre_nuits !== null
          ? String(hebergement.nombre_nuits)
          : "1",
    });
    setErreur("");
  }

  async function handleSaveHebergement(e, hebergementId) {
    e.preventDefault();
    if (!editingHebergementForm.nom.trim()) {
      setErreur("Le nom de l'hébergement est obligatoire.");
      return;
    }

    setErreur("");
    try {
      await api.put(`/accommodations/${hebergementId}`, {
        nom: editingHebergementForm.nom.trim(),
        prix_par_nuit: Number(editingHebergementForm.prix_par_nuit) || 0,
        nombre_nuits: Math.max(1, Number(editingHebergementForm.nombre_nuits) || 1),
      });
      setEditingHebergementId(null);
      await refreshDetails();
    } catch (error) {
      setErreur(
        error.response?.data?.message ||
          "Erreur lors de la modification de l'hébergement."
      );
    }
  }

  async function handleDeleteHebergement(hebergement) {
    setErreur("");
    try {
      await api.delete(`/accommodations/${hebergement.id}`);
      if (editingHebergementId === hebergement.id) setEditingHebergementId(null);
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
  const isOverBudget = budget > 0 && totalDepenses > budget;
  const depassement = Math.max(0, totalDepenses - budget);
  const ratioBudget = budget > 0 ? Math.min(100, Math.round((totalDepenses / budget) * 100)) : 0;

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
          <strong className={isOverBudget ? "text-danger" : ""}>
            {reste.toFixed(2)} DH
          </strong>
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

      {isOverBudget && (
        <section className="details-budget-callout" role="alert">
          <div className="callout-icon-wrap" aria-hidden="true">
            <AlertTriangle size={24} />
          </div>
          <div className="callout-body">
            <div className="callout-title-line">
              <h3>Dépassement de budget détecté</h3>
              <span className="callout-pill">+{depassement.toFixed(2)} DH</span>
            </div>
            <p>
              Les dépenses cumulées de <strong>{details.titre}</strong> atteignent{" "}
              <strong>{totalDepenses.toFixed(2)} DH</strong> pour un budget initial de{" "}
              <strong>{budget.toFixed(2)} DH</strong>. Réduisez le coût d'une activité ou
              d'un hébergement pour revenir dans votre enveloppe.
            </p>
            <div className="callout-metrics">
              <span>
                Budget prévu : <strong>{budget.toFixed(2)} DH</strong>
              </span>
              <span>
                Dépenses : <strong>{totalDepenses.toFixed(2)} DH</strong>
              </span>
              <span>
                Écart : <strong>-{depassement.toFixed(2)} DH</strong>
              </span>
            </div>
            <div className="callout-progress-track" aria-hidden="true">
              <div
                className="callout-progress-fill"
                style={{ width: `${ratioBudget}%` }}
              />
            </div>
          </div>
        </section>
      )}

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
            const isEditingStep = editingStepId === step.id;

            return (
              <div key={step.id} className="step-card">
                {isEditingStep ? (
                  <form
                    onSubmit={(e) => handleSaveStep(e, step.id)}
                    className="step-form edit-inline-form"
                  >
                    <input
                      type="text"
                      placeholder="Nom de l'étape"
                      value={editingStepForm.nom}
                      onChange={(e) =>
                        setEditingStepForm((prev) => ({ ...prev, nom: e.target.value }))
                      }
                      required
                    />
                    <input
                      type="date"
                      value={editingStepForm.date_etape}
                      onChange={(e) =>
                        setEditingStepForm((prev) => ({
                          ...prev,
                          date_etape: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Notes (optionnel)"
                      value={editingStepForm.notes}
                      onChange={(e) =>
                        setEditingStepForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(editingStepForm.est_obligatoire)}
                        onChange={(e) =>
                          setEditingStepForm((prev) => ({
                            ...prev,
                            est_obligatoire: e.target.checked,
                          }))
                        }
                      />
                      Obligatoire
                    </label>
                    <button type="submit">Enregistrer</button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => setEditingStepId(null)}
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <>
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
                          className={
                            isObligatoire ? "badge-obligatoire" : "badge-facultatif"
                          }
                        >
                          {isObligatoire ? "Obligatoire par défaut" : "Facultatif"}
                        </span>
                      </div>

                      {modeEdition && (
                        <div className="step-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => startEditingStep(step)}
                            title="Modifier l'étape"
                            aria-label="Modifier l'étape"
                          >
                            <Pencil size={15} />
                          </button>
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
                  </>
                )}

                {/* --- ACTIVITÉS --- */}
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
                        const isEditingAct = editingActivityId === act.id;

                        if (isEditingAct) {
                          return (
                            <li key={act.id} className="activity-item">
                              <form
                                onSubmit={(e) => handleSaveActivity(e, act.id)}
                                className="activity-form edit-inline-form"
                              >
                                <input
                                  type="text"
                                  placeholder="Nom de l'activité"
                                  value={editingActivityForm.nom}
                                  onChange={(e) =>
                                    setEditingActivityForm((prev) => ({
                                      ...prev,
                                      nom: e.target.value,
                                    }))
                                  }
                                  required
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Coût (DH)"
                                  value={editingActivityForm.cout}
                                  onChange={(e) =>
                                    setEditingActivityForm((prev) => ({
                                      ...prev,
                                      cout: e.target.value,
                                    }))
                                  }
                                />
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(editingActivityForm.est_obligatoire)}
                                    onChange={(e) =>
                                      setEditingActivityForm((prev) => ({
                                        ...prev,
                                        est_obligatoire: e.target.checked,
                                      }))
                                    }
                                  />
                                  Obligatoire
                                </label>
                                <button type="submit">Enregistrer</button>
                                <button
                                  type="button"
                                  className="button-secondary"
                                  onClick={() => setEditingActivityId(null)}
                                >
                                  Annuler
                                </button>
                              </form>
                            </li>
                          );
                        }

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
                                  className="icon-btn"
                                  onClick={() => startEditingActivity(act)}
                                  title="Modifier l'activité"
                                  aria-label="Modifier l'activité"
                                >
                                  <Pencil size={15} />
                                </button>
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

                {/* --- HÉBERGEMENTS --- */}
                <div className="hebergement-block">
                  <h4>
                    <BedDouble size={16} /> Hébergement ({hebergements.length})
                  </h4>
                  {hebergements.length === 0 ? (
                    <p className="empty-hint">Aucun hébergement pour cette étape.</p>
                  ) : (
                    <>
                      <ul className="hebergement-list">
                        {hebergements.map((h) => {
                          const isEditingHeb = editingHebergementId === h.id;

                          if (isEditingHeb) {
                            return (
                              <li key={h.id} className="hebergement-item">
                                <form
                                  onSubmit={(e) => handleSaveHebergement(e, h.id)}
                                  className="hebergement-form edit-inline-form"
                                >
                                  <input
                                    type="text"
                                    placeholder="Nom (hôtel, riad, auberge...)"
                                    value={editingHebergementForm.nom}
                                    onChange={(e) =>
                                      setEditingHebergementForm((prev) => ({
                                        ...prev,
                                        nom: e.target.value,
                                      }))
                                    }
                                    required
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Prix / nuit (DH)"
                                    value={editingHebergementForm.prix_par_nuit}
                                    onChange={(e) =>
                                      setEditingHebergementForm((prev) => ({
                                        ...prev,
                                        prix_par_nuit: e.target.value,
                                      }))
                                    }
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="Nuits"
                                    value={editingHebergementForm.nombre_nuits}
                                    onChange={(e) =>
                                      setEditingHebergementForm((prev) => ({
                                        ...prev,
                                        nombre_nuits: e.target.value,
                                      }))
                                    }
                                  />
                                  <button type="submit">Enregistrer</button>
                                  <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={() => setEditingHebergementId(null)}
                                  >
                                    Annuler
                                  </button>
                                </form>
                              </li>
                            );
                          }

                          return (
                            <li key={h.id} className="hebergement-item">
                              <span>
                                <strong>{h.nom}</strong>
                                <span className="hebergement-detail">
                                  {Number(h.prix_par_nuit || 0).toFixed(2)} DH/nuit ×{" "}
                                  {h.nombre_nuits} nuit(s) = {coutHebergement(h).toFixed(2)} DH
                                </span>
                              </span>
                              {modeEdition && (
                                <div className="hebergement-actions">
                                  <button
                                    type="button"
                                    className="icon-btn"
                                    onClick={() => startEditingHebergement(h)}
                                    title="Modifier l'hébergement"
                                    aria-label="Modifier l'hébergement"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="button-danger"
                                    onClick={() => handleDeleteHebergement(h)}
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              )}
                            </li>
                          );
                        })}
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