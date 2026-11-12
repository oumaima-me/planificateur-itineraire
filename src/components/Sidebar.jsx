function Sidebar({ onNavigate, utilisateur }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h2 className="logo" style={{ fontSize: "1.2rem", padding: "10px", color: "#fff" }}>
          Planificateur de voyages
        </h2>
      </div>

      <nav>
        <ul>
          <li>
            <button onClick={() => onNavigate("dashboard")}>Tableau de bord</button>
          </li>
          <li>
            <button onClick={() => onNavigate("itineraires")}>Mes itinéraires</button>
          </li>
          <li>
            <button onClick={() => onNavigate("creation")}>Créer un itinéraire</button>
          </li>
          
          {/* Espace Admin (Visible uniquement si le rôle est admin selon votre diagramme de classes) */}
          {utilisateur?.role === "admin" && (
            <li>
              <button onClick={() => onNavigate("admin")} style={{ color: "#ffc107" }}>
                Espace Admin (Gestion)
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;