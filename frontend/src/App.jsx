import { useState, useEffect, useCallback } from "react";
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
};

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
  const [page, setPage] = useState(() => localStorage.getItem(STORAGE_KEYS.page) || "dashboard");
  const [itineraires, setItineraires] = useState([]);
  const [itineraireEnCours, setItineraireEnCours] = useState(null);
  const [itineraireSelectionneId, setItineraireSelectionneId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.selectedId);
    return saved ? Number(saved) : null;
  });

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

  const chargerItineraires = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/itineraries");
      const list = Array.isArray(response.data) ? response.data.map(formaterItineraire) : [];
      setItineraires(list);
    } catch (error) {
      console.error("Erreur chargement itinéraires :", error);
      if (error.response?.status === 401) {
        setToken("");
        setUtilisateurConnecte(null);
        localStorage.removeItem(STORAGE_KEYS.page);
        localStorage.removeItem(STORAGE_KEYS.selectedId);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      chargerItineraires();
    } else {
      setItineraires([]);
    }
  }, [token, chargerItineraires]);

  function handleAuthSuccess(authData) {
    const receivedToken = authData?.token || authData?.access_token || "";
    const receivedUser = authData?.user || authData;
    setToken(receivedToken);
    setUtilisateurConnecte(receivedUser);
    setPage("dashboard");
  }

  async function handleLogout() {
    try {
      await api.post("/logout");
    } catch {
      // Ignore network/token expiration errors on logout
    } finally {
      setToken("");
      setUtilisateurConnecte(null);
      setItineraireEnCours(null);
      setItineraireSelectionneId(null);
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

    if (isEditing) {
      setPage("itineraires");
    } else {
      setItineraireSelectionneId(formatted.id);
      setPage("details");
    }
  }

  async function handleDeleteItinerary(id) {
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraires((prev) => prev.filter((item) => item.id !== id));
      if (itineraireSelectionneId === id) {
        setItineraireSelectionneId(null);
        if (page === "details" || page === "summary") setPage("itineraires");
      }
    } catch (error) {
      console.error("Erreur suppression itinéraire :", error);
      alert(error.response?.data?.message || "Erreur lors de la suppression.");
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

  function handleOpenSummary(item) {
    const target = item || itineraireActif;
    if (!target?.id) return;
    setItineraireSelectionneId(target.id);
    setPage("summary");
  }

  function handleSyncUpdatedItinerary(updatedRaw) {
    const formatted = formaterItineraire(updatedRaw);
    setItineraires((prev) =>
      prev.map((item) => (item.id === formatted.id ? formatted : item))
    );
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

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo-container">
          <h1 className="logo">Planificateur</h1>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                type="button"
                className={page === "dashboard" ? "active" : ""}
                onClick={() => {
                  setItineraireEnCours(null);
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
            {itineraireActif && (
              <li>
                <button
                  type="button"
                  className={page === "details" ? "active" : ""}
                  onClick={() => setPage("details")}
                >
                  Détails itinéraire
                </button>
              </li>
            )}
            {itineraireActif && (
              <li>
                <button
                  type="button"
                  className={page === "summary" ? "active" : ""}
                  onClick={() => setPage("summary")}
                >
                  Résumé & Timeline
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
            <p>Organisez vos voyages, étapes, activités et hébergements</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="user-info">
              Connecté :{" "}
              <strong>{utilisateurConnecte?.name || utilisateurConnecte?.email}</strong>
            </span>
            <button type="button" className="button-danger" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            utilisateur={utilisateurConnecte}
            itineraires={itineraires}
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
              setPage("itineraires");
            }}
          />
        )}

        {page === "itineraires" && (
          <MyItineraries
            itineraires={itineraires}
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
            onModifierItineraire={handleSyncUpdatedItinerary}
            onRetour={() => setPage("itineraires")}
            onVoirResume={handleOpenSummary}
          />
        )}

        {page === "summary" && (
          <ItinerarySummary
            itineraire={itineraireActif}
            onRetour={() => setPage("details")}
            onModifier={handleEditItinerary}
          />
        )}
      </div>
    </div>
  );
}

export default App;