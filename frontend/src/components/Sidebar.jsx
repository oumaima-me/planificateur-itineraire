import { LayoutDashboard, Compass, PlusCircle, ShieldCheck } from "lucide-react";

function Sidebar({ onNavigate, pageActuelle, utilisateur }) {
  const estAdmin = utilisateur?.role === "admin";

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <h2 className="logo">🌍 Planificateur</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {!estAdmin ? (
            <>
              <li>
                <button
                  className={pageActuelle === "dashboard" ? "active" : ""}
                  onClick={() => onNavigate("dashboard")}
                >
                  <LayoutDashboard size={18} /> Tableau de bord
                </button>
              </li>

              <li>
                <button
                  className={pageActuelle === "itineraires" ? "active" : ""}
                  onClick={() => onNavigate("itineraires")}
                >
                  <Compass size={18} /> Mes itinéraires
                </button>
              </li>

              <li>
                <button
                  className={pageActuelle === "creation" ? "active" : ""}
                  onClick={() => onNavigate("creation")}
                >
                  <PlusCircle size={18} /> Créer un itinéraire
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                className={`admin-btn ${pageActuelle === "admin" ? "active" : ""}`}
                onClick={() => onNavigate("admin")}
              >
                <ShieldCheck size={18} /> Espace Admin
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;