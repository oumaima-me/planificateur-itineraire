import { useState, useEffect } from "react";
import api from "./api/axios";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MyItineraries from "./pages/MyItineraries";
import CreateItinerary from "./pages/CreateItinerary";
import ItineraryDetails from "./pages/ItineraryDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

function formatItineraryFromApi(item, fallbackSteps = []) {
  const rawSteps = Array.isArray(item.steps) ? item.steps : fallbackSteps;

  const formattedSteps = rawSteps.map((step) => ({
    ...step,
    estObligatoire: Boolean(step.est_obligatoire ?? step.estObligatoire),
    activites: Array.isArray(step.activities) ? step.activities : step.activites || [],
  }));

  return {
    ...item,
    dateDebut: item.date_debut,
    dateFin: item.date_fin,
    budgetTotal: item.budget,
    steps: formattedSteps,
    etapes: formattedSteps,
  };
}

function App() {
  const [utilisateur, setUtilisateur] = useState(() => {
    const savedUser = localStorage.getItem("utilisateur");
    const savedToken = localStorage.getItem("token");
    return savedUser && savedToken ? JSON.parse(savedUser) : null;
  });

  const [authMode, setAuthMode] = useState("login");

  const [pageActuelle, setPageActuelle] = useState(() => {
    return localStorage.getItem("pageActuelle") || "dashboard";
  });

  const [itineraires, setItineraires] = useState([]);
  const [itineraireSelectionne, setItineraireSelectionne] = useState(null);
  const [itineraireAModifier, setItineraireAModifier] = useState(null);

  useEffect(() => {
    localStorage.setItem("pageActuelle", pageActuelle);
  }, [pageActuelle]);

  useEffect(() => {
    if (!utilisateur) {
      setItineraires([]);
      return;
    }

    api
      .get("/itineraries")
      .then((response) => {
        const formatted = response.data.map((item) => formatItineraryFromApi(item));
        setItineraires(formatted);

        const savedSelectedId = localStorage.getItem("itineraireSelectionneId");
        if (savedSelectedId) {
          const found = formatted.find((i) => String(i.id) === String(savedSelectedId));
          if (found) {
            setItineraireSelectionne(found);
          } else if (pageActuelle === "details") {
            setPageActuelle("dashboard");
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des itinéraires :", error);
        if (error.response?.status === 401) {
          setUtilisateur(null);
        }
      });
  }, [utilisateur]);

  function handleAuthSuccess(data) {
    const user = data?.user ?? data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    setUtilisateur(user);
    localStorage.setItem("utilisateur", JSON.stringify(user));
    setPageActuelle("dashboard");
  }

  function handleLogout() {
    api.post("/logout").catch(() => {});
    setUtilisateur(null);
    localStorage.removeItem("utilisateur");
    localStorage.removeItem("token");
    localStorage.removeItem("pageActuelle");
    localStorage.removeItem("itineraireSelectionneId");
    setItineraireSelectionne(null);
    setItineraireAModifier(null);
    setAuthMode("login");
  }

  async function enregistrerItineraire(itinerairesDonnees) {
    const payload = {
      user_id: utilisateur.id,
      titre: itinerairesDonnees.titre,
      description: itinerairesDonnees.description || "",
      destination: itinerairesDonnees.destination,
      date_debut: itinerairesDonnees.dateDebut || null,
      date_fin: itinerairesDonnees.dateFin || null,
      budget: itinerairesDonnees.budgetTotal ?? null,
    };

    try {
      if (itineraireAModifier) {
        const response = await api.put(`/itineraries/${itineraireAModifier.id}`, payload);
        const misAJour = formatItineraryFromApi(response.data, itineraireAModifier.etapes || []);

        setItineraires((prev) =>
          prev.map((i) => (i.id === misAJour.id ? misAJour : i))
        );
        if (itineraireSelectionne?.id === misAJour.id) {
          setItineraireSelectionne(misAJour);
        }
      } else {
        const response = await api.post("/itineraries", payload);
        const nouveau = formatItineraryFromApi(response.data);

        setItineraires((prev) => [nouveau, ...prev]);
      }

      setItineraireAModifier(null);
      setPageActuelle("itineraires");
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'itinéraire :",
        error.response?.status,
        error.response?.data || error.message
      );

      const validationMsg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(" | ")
        : null;

      alert(
        validationMsg ||
          error.response?.data?.message ||
          "Impossible d'enregistrer l'itinéraire. Vérifiez la console."
      );
    }
  }

  async function supprimerItineraire(id) {
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraires((prev) => prev.filter((i) => i.id !== id));
      if (itineraireSelectionne?.id === id) {
        setItineraireSelectionne(null);
        localStorage.removeItem("itineraireSelectionneId");
        setPageActuelle("itineraires");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  }

  function preparerModificationItineraire(itineraire) {
    setItineraireAModifier(itineraire);
    setPageActuelle("creation");
  }

  function ouvrirDetails(itineraire) {
    setItineraireSelectionne(itineraire);
    localStorage.setItem("itineraireSelectionneId", String(itineraire.id));
    setPageActuelle("details");
  }

  if (!utilisateur) {
    return (
      <div className="auth-wrapper">
        {authMode === "login" ? (
          <Login
            onLogin={handleAuthSuccess}
            onSwitchToRegister={() => setAuthMode("register")}
          />
        ) : (
          <Register
            onRegister={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }

  function afficherPage() {
    switch (pageActuelle) {
      case "dashboard":
        return (
          <Dashboard
            itineraires={itineraires}
            utilisateur={utilisateur}
            onNavigate={setPageActuelle}
            onOuvrirDetails={ouvrirDetails}
            onModifierItineraire={preparerModificationItineraire}
            onSupprimer={supprimerItineraire}
          />
        );
      case "itineraires":
        return (
          <MyItineraries
            itineraires={itineraires}
            onOuvrirDetails={ouvrirDetails}
            onModifierItineraire={preparerModificationItineraire}
            onSupprimer={supprimerItineraire}
          />
        );
      case "creation":
        return (
          <CreateItinerary
            onEnregistrer={enregistrerItineraire}
            itineraireAModifier={itineraireAModifier}
            onAnnulerModification={() => {
              setItineraireAModifier(null);
              setPageActuelle("itineraires");
            }}
          />
        );
      case "details":
        return (
          <ItineraryDetails
            itineraire={itineraireSelectionne}
            onModifierItineraire={(misAJour) => {
              const formatted = formatItineraryFromApi(misAJour);
              setItineraires((prev) =>
                prev.map((i) => (i.id === formatted.id ? formatted : i))
              );
              setItineraireSelectionne(formatted);
            }}
          />
        );
      default:
        return (
          <Dashboard
            itineraires={itineraires}
            utilisateur={utilisateur}
            onNavigate={setPageActuelle}
            onOuvrirDetails={ouvrirDetails}
            onModifierItineraire={preparerModificationItineraire}
            onSupprimer={supprimerItineraire}
          />
        );
    }
  }

  return (
    <div className="app">
      <Sidebar
        onNavigate={setPageActuelle}
        pageActuelle={pageActuelle}
        utilisateur={utilisateur}
      />
      <main className="main-content">
        <header className="header">
          <span className="user-info">
            Connecté en tant que : <strong>{utilisateur.nom || utilisateur.name}</strong>
          </span>
          <button onClick={handleLogout} className="button-danger">
            Se déconnecter
          </button>
        </header>
        {afficherPage()}
      </main>
    </div>
  );
}

export default App;