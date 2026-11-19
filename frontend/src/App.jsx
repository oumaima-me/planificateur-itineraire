import { useState, useEffect } from "react";
import api from "./api/axios";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MyItineraries from "./pages/MyItineraries";
import CreateItinerary from "./pages/CreateItinerary";
import ItineraryDetails from "./pages/ItineraryDetails";
import AdminSpace from "./pages/AdminSpace";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [utilisateur, setUtilisateur] = useState(() => {
    const savedUser = localStorage.getItem("utilisateur");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authMode, setAuthMode] = useState("login");

  const [utilisateurs, setUtilisateurs] = useState([
    { id: 1, nom: "Mohamed (Admin)", email: "admin@example.com", role: "admin" },
    { id: 2, nom: "Fatima (Voyageuse)", email: "fatima@example.com", role: "user" },
  ]);

  const [pageActuelle, setPageActuelle] = useState(() => {
    const savedUser = localStorage.getItem("utilisateur");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role === "admin" ? "admin" : "dashboard";
    }
    return "dashboard";
  });

  const [itineraires, setItineraires] = useState([]);

  // Charger les itinéraires depuis l'API Laravel au démarrage
  useEffect(() => {
    if (utilisateur) {
      api.get("/itineraries")
        .then((response) => {
          // Transformation des données Laravel (snake_case) vers le format React (camelCase)
          const formatted = response.data.map((item) => ({
            ...item,
            dateDebut: item.date_debut,
            dateFin: item.date_fin,
            budgetTotal: item.budget,
            etapes: item.steps || [],
          }));
          setItineraires(formatted);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des itinéraires :", error);
        });
    }
  }, [utilisateur]);

  const [itineraireSelectionne, setItineraireSelectionne] = useState(null);
  const [itineraireAModifier, setItineraireAModifier] = useState(null);

  function handleLogin(data) {
    const user = data?.user ?? data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    setUtilisateur(user);
    localStorage.setItem("utilisateur", JSON.stringify(user));
    setPageActuelle(user.role === "admin" ? "admin" : "dashboard");
  }

  function handleRegister(data) {
    const newUser = data?.user ?? data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    setUtilisateurs((prev) => {
      const exists = prev.some((u) => u.id === newUser.id || u.email === newUser.email);
      return exists ? prev : [...prev, newUser];
    });
    handleLogin(data);
  }

  function handleLogout() {
    api.post("/logout").catch(() => {});
    setUtilisateur(null);
    localStorage.removeItem("utilisateur");
    localStorage.removeItem("token");
    setAuthMode("login");
  }

  async function enregistrerItineraire(itinerairesDonnees) {
    const payload = {
      user_id: utilisateur.id,
      titre: itinerairesDonnees.titre,
      description: itinerairesDonnees.description || "",
      destination: itinerairesDonnees.destination,
      date_debut: itinerairesDonnees.dateDebut,
      date_fin: itinerairesDonnees.dateFin,
      budget: itinerairesDonnees.budgetTotal,
    };

    try {
      if (itineraireAModifier) {
        // Modification (PUT)
        const response = await api.put(`/itineraries/${itineraireAModifier.id}`, payload);
        const misAJour = {
          ...response.data,
          dateDebut: response.data.date_debut,
          dateFin: response.data.date_fin,
          budgetTotal: response.data.budget,
          etapes: itineraireAModifier.etapes || [],
        };
        setItineraires(itineraires.map((i) => (i.id === misAJour.id ? misAJour : i)));
      } else {
        // Création (POST)
        const response = await api.post("/itineraries", payload);
        const nouveau = {
          ...response.data,
          dateDebut: response.data.date_debut,
          dateFin: response.data.date_fin,
          budgetTotal: response.data.budget,
          etapes: [],
        };
        setItineraires([...itineraires, nouveau]);
      }

      setItineraireAModifier(null);
      setPageActuelle("itineraires");
    } catch (error) {
      console.error(
        "Erreur POST /itineraries :",
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
      setItineraires(itineraires.filter((i) => i.id !== id));
      if (itineraireSelectionne?.id === id) {
        setItineraireSelectionne(null);
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
    setPageActuelle("details");
  }

  function supprimerUtilisateur(id) {
    setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
  }

  if (!utilisateur) {
    return (
      <div className="auth-wrapper">
        {authMode === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode("register")}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }

  function afficherPage() {
    if (utilisateur.role === "admin") {
      return (
        <AdminSpace
          utilisateurs={utilisateurs}
          itineraires={itineraires}
          onSupprimerUtilisateur={supprimerUtilisateur}
          onSupprimerItineraire={supprimerItineraire}
        />
      );
    }

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
              setItineraires(itineraires.map((i) => (i.id === misAJour.id ? misAJour : i)));
              setItineraireSelectionne(misAJour);
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
      <Sidebar onNavigate={setPageActuelle} pageActuelle={pageActuelle} utilisateur={utilisateur} />
      <main className="main-content">
        <header className="header">
          <span className="user-info">
            Connecté en tant que : <strong>{utilisateur.nom}</strong> ({utilisateur.role})
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