import { useMemo } from "react";
import {
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
  CircleDot,
  BedDouble,
  Compass,
  ArrowLeft,
  Flag,
  TrendingDown,
  Pencil,
} from "lucide-react";

function ItinerarySummary({ itineraire, onRetour, onModifier }) {
  const financialSummary = useMemo(() => {
    const initialBudget = Number(itineraire?.budget ?? itineraire?.budgetTotal ?? 0);
    const rawSteps = [...(itineraire?.steps || itineraire?.etapes || [])].sort(
      (a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0)
    );

    let cumulativeSpent = 0;

    const enrichedSteps = rawSteps.map((step, index) => {
      const activities = step.activities || step.activites || [];
      const accommodations = step.accommodations || step.hebergements || [];
      const isObligatoire = Boolean(step.est_obligatoire ?? step.estObligatoire);

      const activitiesCost = activities.reduce(
        (sum, act) => sum + (Number(act.cout) || 0),
        0
      );

      const accommodationsCost = accommodations.reduce(
        (sum, acc) =>
          sum + (Number(acc.prix_par_nuit) || 0) * (Number(acc.nombre_nuits) || 1),
        0
      );

      const stepTotal = activitiesCost + accommodationsCost;
      cumulativeSpent += stepTotal;
      const remainingAfterStep = initialBudget - cumulativeSpent;

      return {
        ...step,
        stepNumber: index + 1,
        isObligatoire,
        activities,
        accommodations,
        activitiesCost,
        accommodationsCost,
        stepTotal,
        cumulativeSpent,
        remainingAfterStep,
      };
    });

    return {
      initialBudget,
      totalSpent: cumulativeSpent,
      finalRemaining: initialBudget - cumulativeSpent,
      steps: enrichedSteps,
    };
  }, [itineraire]);

  if (!itineraire) {
    return (
      <div className="summary-page">
        <div className="card">
          <p>Aucun itinéraire sélectionné pour le résumé.</p>
          {onRetour && (
            <button type="button" className="button-secondary" onClick={onRetour}>
              <ArrowLeft size={16} /> Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  const { initialBudget, totalSpent, finalRemaining, steps } = financialSummary;
  const isOverBudget = finalRemaining < 0;

  return (
    <div className="summary-page">
      <div className="summary-topbar">
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {onRetour && (
            <button type="button" className="button-secondary" onClick={onRetour}>
              <ArrowLeft size={16} /> Retour aux détails
            </button>
          )}
          {onModifier && (
            <button
              type="button"
              className="button-secondary"
              onClick={() => onModifier(itineraire)}
            >
              <Pencil size={15} /> Continuer l'édition
            </button>
          )}
        </div>
        <span className="summary-badge">Feuille de route & Bilan financier</span>
      </div>

      {/* Bloc Départ : Titre & Budget Initial */}
      <header className="summary-hero-card">
        <div className="summary-hero-info">
          <h1>{itineraire.titre}</h1>
          <div className="summary-meta">
            <span>
              <MapPin size={16} /> {itineraire.destination}
            </span>
            <span>
              <Calendar size={16} />{" "}
              {itineraire.date_debut || itineraire.dateDebut || "—"} →{" "}
              {itineraire.date_fin || itineraire.dateFin || "Non définie"}
            </span>
          </div>
        </div>

        <div className="summary-start-budget">
          <div className="budget-label">
            <Wallet size={18} /> Budget de départ
          </div>
          <div className="budget-value">{initialBudget.toFixed(2)} DH</div>
        </div>
      </header>

      {/* Long trait vertical étape par étape */}
      <section className="timeline-wrapper">
        <div className="timeline-endpoint start-point">
          <div className="endpoint-dot">
            <Flag size={16} />
          </div>
          <div className="endpoint-text">
            <strong>Départ du voyage</strong> — Budget disponible :{" "}
            <span>{initialBudget.toFixed(2)} DH</span>
          </div>
        </div>

        <div className="timeline-track">
          {steps.length === 0 ? (
            <p className="empty-hint">Aucune étape planifiée sur cet itinéraire.</p>
          ) : (
            steps.map((step) => (
              <div key={step.id} className="timeline-node">
                <div
                  className={`timeline-marker ${
                    step.isObligatoire ? "mandatory" : "optional"
                  }`}
                >
                  {step.stepNumber}
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-header">
                    <div>
                      <span
                        className={`step-tag ${
                          step.isObligatoire ? "tag-required" : "tag-optional"
                        }`}
                      >
                        {step.isObligatoire ? (
                          <>
                            <CheckCircle2 size={13} /> Étape obligatoire
                          </>
                        ) : (
                          <>
                            <CircleDot size={13} /> Étape optionnelle
                          </>
                        )}
                      </span>
                      <h3>{step.nom}</h3>
                      {step.date_etape && (
                        <small className="step-date">Date : {step.date_etape}</small>
                      )}
                    </div>

                    <div className="step-finance-box">
                      <div className="step-cost">
                        <span>Coût étape</span>
                        <strong>-{step.stepTotal.toFixed(2)} DH</strong>
                      </div>
                      <div
                        className={`step-remaining ${
                          step.remainingAfterStep < 0 ? "negative" : ""
                        }`}
                      >
                        <span>Reste après étape</span>
                        <strong>{step.remainingAfterStep.toFixed(2)} DH</strong>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-card-body">
                    {step.activities.length > 0 && (
                      <div className="sub-items-group">
                        <h4>
                          <Compass size={15} /> Activités ({step.activities.length})
                        </h4>
                        <ul>
                          {step.activities.map((act) => (
                            <li key={act.id}>
                              <span>{act.nom}</span>
                              <span className="item-price">
                                {Number(act.cout || 0).toFixed(2)} DH
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.accommodations.length > 0 && (
                      <div className="sub-items-group">
                        <h4>
                          <BedDouble size={15} /> Hébergements ({step.accommodations.length})
                        </h4>
                        <ul>
                          {step.accommodations.map((acc) => {
                            const totalNights =
                              (Number(acc.prix_par_nuit) || 0) *
                              (Number(acc.nombre_nuits) || 1);
                            return (
                              <li key={acc.id}>
                                <span>
                                  {acc.nom} ({acc.nombre_nuits || 1} nuit(s) ×{" "}
                                  {Number(acc.prix_par_nuit || 0).toFixed(2)} DH)
                                </span>
                                <span className="item-price">
                                  {totalNights.toFixed(2)} DH
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {step.activities.length === 0 && step.accommodations.length === 0 && (
                      <p className="no-subitems">
                        Aucune activité ou hébergement enregistré sur cette étape.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="timeline-endpoint end-point">
          <div className="endpoint-dot finish">
            <TrendingDown size={16} />
          </div>
          <div className="endpoint-text">
            <strong>Fin du parcours</strong> — Total dépensé :{" "}
            <span>{totalSpent.toFixed(2)} DH</span>
          </div>
        </div>
      </section>

      {/* Bilan Financier Final */}
      <footer
        className={`summary-final-card ${
          isOverBudget ? "over-budget" : "within-budget"
        }`}
      >
        <div className="final-stat">
          <span>Budget initial</span>
          <strong>{initialBudget.toFixed(2)} DH</strong>
        </div>
        <div className="final-stat">
          <span>Total des dépenses</span>
          <strong>-{totalSpent.toFixed(2)} DH</strong>
        </div>
        <div className="final-stat highlight">
          <span>
            {isOverBudget ? "Dépassement de budget" : "Solde final restant"}
          </span>
          <strong>{finalRemaining.toFixed(2)} DH</strong>
        </div>
      </footer>
    </div>
  );
}

export default ItinerarySummary;