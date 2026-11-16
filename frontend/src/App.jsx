import { useState } from "react";
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

  const [itineraires, setItineraires] = useState([
    {
      id: 1,
      titre: "Roadtrip du Nord",
      destination: "Tanger - Chefchaouen",
      dateDebut: "2026-07-01",
      dateFin: "2026-07-10",
      budgetTotal: 5000,
      etapes: [],
    },
  ]);

  const [itineraireSelectionne, setItineraireSelectionne] = useState(null);
  const [itineraireAModifier, setItineraireAModifier] = useState(null);

  function handleLogin(user) {
    setUtilisateur(user);
    localStorage.setItem("utilisateur", JSON.stringify(user));
    setPageActuelle(user.role === "admin" ? "admin" : "dashboard");
  }

  function handleRegister(newUser) {
    setUtilisateurs([...utilisateurs, newUser]);
    handleLogin(newUser);
  }

  function handleLogout() {
    setUtilisateur(null);
    localStorage.removeItem("utilisateur");
    setAuthMode("login");
  }

  function enregistrerItineraire(itinerairesDonnees) {
    const existe = itineraires.some((i) => i.id === itinerairesDonnees.id);
    if (existe) {
      setItineraires(itineraires.map((i) => (i.id === itinerairesDonnees.id ? itinerairesDonnees : i)));
    } else {
      setItineraires([...itineraires, itinerairesDonnees]);
    }
    setItineraireAModifier(null);
    setPageActuelle("itineraires");
  }

  function supprimerItineraire(id) {
    setItineraires(itineraires.filter((i) => i.id !== id));
    if (itineraireSelectionne?.id === id) {
      setItineraireSelectionne(null);
      setPageActuelle("itineraires");
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