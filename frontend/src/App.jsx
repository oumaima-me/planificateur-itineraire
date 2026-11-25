import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import api from "./api/axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateItinerary from "./pages/CreateItinerary";
import MyItineraries from "./pages/MyItineraries";
import ItineraryDetails from "./pages/ItineraryDetails";
import ItinerarySummary from "./pages/ItinerarySummary";
import "./App.css";

const STORAGE_KEYS = {
  token: "auth_token",
  user: "auth_user",
  page: "active_page",
  selectedId: "selected_itinerary_id",
  completedIds: "completed_itinerary_ids",
};

function getUserKey(user) {
  if (!user) return "guest";
  const idPart = user.id !== undefined && user.id !== null ? String(user.id) : "";
  const emailPart = user.email ? String(user.email).trim().toLowerCase() : "";
  return `${idPart}_${emailPart}` || "guest";
}

function getNotifStorageKey(user) {
  return `routenotes_notifications_${getUserKey(user)}`;
}

function getAlertedOverBudgetKey(user) {
  return `routenotes_alerted_over_budget_${getUserKey(user)}`;
}

function loadUserNotifications(user) {
  try {
    const raw = localStorage.getItem(getNotifStorageKey(user));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadAlertedOverBudgetIds(user) {
  try {
    const raw = localStorage.getItem(getAlertedOverBudgetKey(user));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

function saveAlertedOverBudgetIds(user, ids) {
  if (!user) return;
  localStorage.setItem(getAlertedOverBudgetKey(user), JSON.stringify(ids));
}

function formaterItineraire(item) {
  const steps = item.steps || item.etapes || [];
  const totalSteps = steps.length;
  const mandatorySteps = steps.filter((s) =>
    Boolean(s.est_obligatoire ?? s.estObligatoire)
  ).length;

  return {
    ...item,
    dateDebut: item.date_debut || item.dateDebut || "",
    dateFin: item.date_fin || item.dateFin || "",
    budgetTotal: Number(item.budget ?? item.budgetTotal ?? 0),
    budget: Number(item.budget ?? item.budgetTotal ?? 0),
    steps,
    etapes: steps,
    totalSteps,
    mandatorySteps,
  };
}

function calculerDepensesItineraire(item) {
  const steps = item?.steps || item?.etapes || [];
  return steps.reduce((sum, step) => {
    const activities = step.activities || step.activites || [];
    const accommodations = step.accommodations || step.hebergements || [];
    const actCost = activities.reduce((aSum, a) => aSum + (Number(a.cout) || 0), 0);
    const hebCost = accommodations.reduce(
      (hSum, h) =>
        hSum + (Number(h.prix_par_nuit) || 0) * (Number(h.nombre_nuits) || 1),
      0
    );
    return sum + actCost + hebCost;
  }, 0);
}

function getInitiales(user) {
  const raw = user?.nom || user?.name || user?.email || "U";
  const parts = String(raw).trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return String(raw).slice(0, 2).toUpperCase();
}

function getInitialPage() {
  const savedPage = localStorage.getItem(STORAGE_KEYS.page) || "dashboard";
  const savedSelectedId = localStorage.getItem(STORAGE_KEYS.selectedId);

  if (savedPage === "summary") {
    return savedSelectedId ? "details" : "itineraires";
  }
  if (savedPage === "details" && !savedSelectedId) {
    return "itineraires";
  }
  return savedPage;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || "");
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.user);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState(getInitialPage);
  const [itineraires, setItineraires] = useState([]);
  const [itineraireEnCours, setItineraireEnCours] = useState(null);
  const [itineraireSelectionneId, setItineraireSelectionneId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.selectedId);
    return saved ? Number(saved) : null;
  });

  const [completedItineraryIds, setCompletedItineraryIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.completedIds);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() =>
    loadUserNotifications(utilisateurConnecte)
  );
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showTemporaryToast = useCallback((notif) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setActiveToast(notif);
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const pushNotification = useCallback(
    (title, message, type = "info", autoPop = true, dedupeKey = null) => {
      const id =
        dedupeKey || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry = { id, title, message, type, read: false };

      setNotifications((prev) => {
        if (dedupeKey && prev.some((n) => n.id === dedupeKey)) {
          return prev;
        }
        return [entry, ...prev.slice(0, 19)];
      });

      if (autoPop) {
        showTemporaryToast(entry);
      }
    },
    [showTemporaryToast]
  );

  useEffect(() => {
    if (!token || !utilisateurConnecte) {
      setNotifications([]);
      setActiveToast(null);
      return;
    }
    setNotifications(loadUserNotifications(utilisateurConnecte));
    setActiveToast(null);
  }, [token, utilisateurConnecte]);

  useEffect(() => {
    if (token && utilisateurConnecte) {
      localStorage.setItem(
        getNotifStorageKey(utilisateurConnecte),
        JSON.stringify(notifications)
      );
    }
  }, [notifications, token, utilisateurConnecte]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (utilisateurConnecte) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(utilisateurConnecte));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [utilisateurConnecte]);

  useEffect(() => {
    if (token && page) {
      localStorage.setItem(STORAGE_KEYS.page, page);
    }
  }, [token, page]);

  useEffect(() => {
    if (itineraireSelectionneId) {
      localStorage.setItem(STORAGE_KEYS.selectedId, String(itineraireSelectionneId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedId);
    }
  }, [itineraireSelectionneId]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.completedIds,
      JSON.stringify(completedItineraryIds)
    );
  }, [completedItineraryIds]);

  const chargerItineraires = useCallback(async () => {
    if (!token || !utilisateurConnecte) return;
    try {
      const response = await api.get("/itineraries");
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const list = rawList.map(formaterItineraire);
      setItineraires(list);

      let alertedIds = loadAlertedOverBudgetIds(utilisateurConnecte);
      let alertedChanged = false;

      const withinBudgetIds = new Set();
      for (const item of list) {
        const budget = Number(item.budget ?? item.budgetTotal ?? 0);
        const depenses = calculerDepensesItineraire(item);
        if (budget <= 0 || depenses <= budget) {
          withinBudgetIds.add(Number(item.id));
        }
      }

      if (alertedIds.some((id) => withinBudgetIds.has(id))) {
        alertedIds = alertedIds.filter((id) => !withinBudgetIds.has(id));
        alertedChanged = true;
      }

      setNotifications((prev) => {
        const next = [...prev];

        for (const item of list) {
          const idNum = Number(item.id);
          const budget = Number(item.budget ?? item.budgetTotal ?? 0);
          const depenses = calculerDepensesItineraire(item);

          if (budget > 0 && depenses > budget) {
            const key = `over-budget-${item.id}`;
            if (!next.some((n) => n.id === key)) {
              next.unshift({
                id: key,
                title: "Budget dépassé",
                message: `"${item.titre}" dépasse son budget (${depenses.toFixed(2)} DH / ${budget.toFixed(2)} DH).`,
                type: "warning",
                read: false,
              });
            }
            if (!alertedIds.includes(idNum)) {
              alertedIds.push(idNum);
              alertedChanged = true;
            }
          }

          if (!item.dateDebut && !item.dateFin) {
            const key = `no-dates-${item.id}`;
            if (!next.some((n) => n.id === key)) {
              next.unshift({
                id: key,
                title: "Dates à préciser",
                message: `Ajoutez des dates à "${item.titre}" pour mieux suivre votre voyage.`,
                type: "info",
                read: false,
              });
            }
          }
        }

        return next.slice(0, 20);
      });

      if (alertedChanged) {
        saveAlertedOverBudgetIds(utilisateurConnecte, alertedIds);
      }
    } catch (error) {
      console.error("Erreur chargement itinéraires :", error);
      if (error.response?.status === 401) {
        setToken("");
        setUtilisateurConnecte(null);
        localStorage.removeItem(STORAGE_KEYS.page);
        localStorage.removeItem(STORAGE_KEYS.selectedId);
      }
    }
  }, [token, utilisateurConnecte]);

  useEffect(() => {
    if (token && utilisateurConnecte) {
      chargerItineraires();
    } else {
      setItineraires([]);
    }
  }, [token, utilisateurConnecte, chargerItineraires]);

  function handleAuthSuccess(authData) {
    const receivedToken = authData?.token || authData?.access_token || "";
    const receivedUser = authData?.user || authData;
    const userNotifs = loadUserNotifications(receivedUser);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
    setToken(receivedToken);
    setUtilisateurConnecte(receivedUser);
    setItineraireSelectionneId(null);
    setPage("dashboard");

    const welcomeNotif = {
      id: `login-${Date.now()}`,
      title: "Connexion réussie",
      message: `Bienvenue ${receivedUser?.nom || receivedUser?.name || ""} !`,
      type: "success",
      read: false,
    };
    setNotifications([welcomeNotif, ...userNotifs].slice(0, 20));
    showTemporaryToast(welcomeNotif);
  }

  async function handleLogout() {
    try {
      await api.post("/logout");
    } catch {
      // Ignore network/token expiration errors on logout
    } finally {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setActiveToast(null);
      setNotifications([]);
      setToken("");
      setUtilisateurConnecte(null);
      setItineraireEnCours(null);
      setItineraireSelectionneId(null);
      setShowNotifPanel(false);
      localStorage.removeItem(STORAGE_KEYS.page);
      localStorage.removeItem(STORAGE_KEYS.selectedId);
    }
  }

  function handleSaveItinerary(savedData) {
    const formatted = formaterItineraire(savedData);
    const isEditing = Boolean(itineraireEnCours?.id);

    setItineraires((prev) => {
      const exists = prev.some((item) => item.id === formatted.id);
      if (exists) {
        return prev.map((item) => (item.id === formatted.id ? formatted : item));
      }
      return [formatted, ...prev];
    });

    setItineraireEnCours(null);
    pushNotification(
      isEditing ? "Itinéraire mis à jour" : "Itinéraire créé",
      `"${formatted.titre}" (${formatted.destination}) a bien été enregistré.`,
      "success",
      true
    );

    if (isEditing) {
      setPage("itineraires");
    } else {
      setItineraireSelectionneId(formatted.id);
      setPage("details");
    }
  }

  async function handleDeleteItinerary(id) {
    const target = itineraires.find((item) => item.id === id);
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraires((prev) => prev.filter((item) => item.id !== id));
      setCompletedItineraryIds((prev) => prev.filter((itemId) => itemId !== Number(id)));

      if (utilisateurConnecte) {
        const updatedAlerted = loadAlertedOverBudgetIds(utilisateurConnecte).filter(
          (itemId) => itemId !== Number(id)
        );
        saveAlertedOverBudgetIds(utilisateurConnecte, updatedAlerted);
      }

      if (itineraireSelectionneId === id) {
        setItineraireSelectionneId(null);
        if (page === "details" || page === "summary") setPage("itineraires");
      }
      pushNotification(
        "Itinéraire supprimé",
        target ? `"${target.titre}" a été supprimé.` : "L'itinéraire a été supprimé.",
        "info",
        true
      );
    } catch (error) {
      console.error("Erreur suppression itinéraire :", error);
      pushNotification(
        "Erreur de suppression",
        error.response?.data?.message || "Impossible de supprimer cet itinéraire.",
        "warning",
        true
      );
    }
  }

  function handleEditItinerary(item) {
    setItineraireEnCours(item);
    setPage("create");
  }

  function handleSelectDetails(item) {
    setItineraireSelectionneId(item.id);
    setPage("details");
  }

  function handleFinalizeAndOpenSummary(item) {
    const target = item || itineraireActif;
    if (!target?.id) {
      setPage("itineraires");
      return;
    }
    const numericId = Number(target.id);
    setCompletedItineraryIds((prev) =>
      prev.includes(numericId) ? prev : [...prev, numericId]
    );
    setItineraireSelectionneId(numericId);
    setPage("summary");
    pushNotification(
      "Planning terminé",
      `Résumé et timeline générés pour "${target.titre}".`,
      "success",
      true
    );
  }

  function handleSyncUpdatedItinerary(updatedRaw) {
    const formatted = formaterItineraire(updatedRaw);
    setItineraires((prev) =>
      prev.map((item) => (item.id === formatted.id ? formatted : item))
    );

    if (!utilisateurConnecte) return;

    const idNum = Number(formatted.id);
    const budget = Number(formatted.budget ?? formatted.budgetTotal ?? 0);
    const depenses = calculerDepensesItineraire(formatted);
    const isOver = budget > 0 && depenses > budget;
    let alertedIds = loadAlertedOverBudgetIds(utilisateurConnecte);

    if (isOver && !alertedIds.includes(idNum)) {
      alertedIds = [...alertedIds, idNum];
      saveAlertedOverBudgetIds(utilisateurConnecte, alertedIds);
      pushNotification(
        "Dépassement de budget !",
        `"${formatted.titre}" dépasse son budget de ${(depenses - budget).toFixed(2)} DH (${depenses.toFixed(2)} DH / ${budget.toFixed(2)} DH).`,
        "warning",
        true,
        `over-budget-${formatted.id}`
      );
    } else if (!isOver && alertedIds.includes(idNum)) {
      alertedIds = alertedIds.filter((itemId) => itemId !== idNum);
      saveAlertedOverBudgetIds(utilisateurConnecte, alertedIds);
    }
  }

  if (!token || !utilisateurConnecte) {
    return (
      <div className="auth-wrapper">
        {authMode === "login" ? (
          <Login
            onLoginSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthMode("register")}
          />
        ) : (
          <Register
            onRegister={handleAuthSuccess}
            onRegisterSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }

  const itineraireActif =
    itineraires.find((item) => item.id === itineraireSelectionneId) || null;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const userInitials = getInitiales(utilisateurConnecte);

  return (
    <div className="app">
      {activeToast && (
        <div
          className={`notif-toast ${activeToast.type || "info"}`}
          role="status"
          aria-live="polite"
        >
          <div>
            <strong>{activeToast.title}</strong>
            <p>{activeToast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setActiveToast(null)}
            aria-label="Fermer la notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <aside className="sidebar">
        <div className="logo-container">
          <h1 className="logo">RouteNotes</h1>
          <span className="logo-sub">Carnet de voyage</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                type="button"
                className={page === "dashboard" ? "active" : ""}
                onClick={() => {
                  setItineraireEnCours(null);
                  setItineraireSelectionneId(null);
                  setPage("dashboard");
                }}
              >
                Tableau de bord
              </button>
            </li>
            <li>
              <button
                type="button"
                className={page === "itineraires" ? "active" : ""}
                onClick={() => {
                  setItineraireEnCours(null);
                  setItineraireSelectionneId(null);
                  setPage("itineraires");
                }}
              >
                Mes itinéraires
              </button>
            </li>
            <li>
              <button
                type="button"
                className={page === "create" ? "active" : ""}
                onClick={() => {
                  setItineraireEnCours(null);
                  setPage("create");
                }}
              >
                Nouvel itinéraire
              </button>
            </li>
            {itineraireActif && (page === "details" || page === "summary") && (
              <li>
                <button
                  type="button"
                  className={page === "details" ? "active" : ""}
                  onClick={() => setPage("details")}
                >
                  Détails : {itineraireActif.titre}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div>
            <h2>Planificateur d'itinéraires</h2>
            <p>Étapes, activités, hébergements et budget en un coup d'œil</p>
          </div>
          <div className="header-right">
            <div className="notif-wrapper">
              <button
                type="button"
                className="notif-btn"
                aria-label="Notifications"
                onClick={() => setShowNotifPanel((prev) => !prev)}
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifPanel && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    <strong>Notifications</strong>
                    <div className="notif-panel-actions">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, read: true }))
                            )
                          }
                          title="Tout marquer comme lu"
                        >
                          <Check size={14} /> Lu
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setNotifications([])}
                          title="Effacer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowNotifPanel(false)}
                        title="Fermer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="notif-empty">Aucune notification pour le moment.</p>
                  ) : (
                    <ul className="notif-list">
                      {notifications.map((notif) => (
                        <li
                          key={notif.id}
                          className={`notif-item ${notif.type} ${
                            notif.read ? "read" : "unread"
                          }`}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notif.id ? { ...n, read: true } : n
                              )
                            )
                          }
                        >
                          <strong>{notif.title}</strong>
                          <span>{notif.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="user-pill">
              <span className="user-avatar" aria-hidden="true">
                {userInitials}
              </span>
              <span className="user-info">
                <strong>
                  {utilisateurConnecte?.nom ||
                    utilisateurConnecte?.name ||
                    utilisateurConnecte?.email}
                </strong>
              </span>
            </div>

            <button type="button" className="button-danger" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            utilisateur={utilisateurConnecte}
            itineraires={itineraires}
            completedItineraryIds={completedItineraryIds}
            onNouvelItineraire={() => {
              setItineraireEnCours(null);
              setPage("create");
            }}
            onVoirDetails={handleSelectDetails}
            onModifier={handleEditItinerary}
            onSupprimer={handleDeleteItinerary}
            onAllerMesItineraires={() => setPage("itineraires")}
          />
        )}

        {page === "create" && (
          <CreateItinerary
            itineraireAEditer={itineraireEnCours}
            onSave={handleSaveItinerary}
            onAnnuler={() => {
              setItineraireEnCours(null);
              setPage("dashboard");
            }}
          />
        )}

        {page === "itineraires" && (
          <MyItineraries
            itineraires={itineraires}
            completedItineraryIds={completedItineraryIds}
            onNouvelItineraire={() => {
              setItineraireEnCours(null);
              setPage("create");
            }}
            onVoirDetails={handleSelectDetails}
            onModifier={handleEditItinerary}
            onSupprimer={handleDeleteItinerary}
          />
        )}

        {page === "details" && (
          <ItineraryDetails
            itineraire={itineraireActif}
            isPlanningCompleted={completedItineraryIds.includes(
              Number(itineraireActif?.id)
            )}
            onModifierItineraire={handleSyncUpdatedItinerary}
            onRetour={() => {
              setItineraireSelectionneId(null);
              setPage("itineraires");
            }}
            onTerminerPlanning={handleFinalizeAndOpenSummary}
          />
        )}

        {page === "summary" && (
          <ItinerarySummary
            itineraire={itineraireActif}
            isPlanningCompleted={completedItineraryIds.includes(
              Number(itineraireActif?.id)
            )}
            onRetour={() => setPage("details")}
            onRetourListe={() => {
              setItineraireSelectionneId(null);
              setPage("itineraires");
            }}
            onModifier={handleEditItinerary}
          />
        )}
      </div>
    </div>
  );
}

export default App;