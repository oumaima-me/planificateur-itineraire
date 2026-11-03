function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <h2 className="logo">Planificateur</h2>

      <nav>
        <ul>
          <li>
            <button onClick={() => onNavigate("dashboard")}>
              Tableau de bord
            </button>
          </li>

          <li>
            <button onClick={() => onNavigate("itineraires")}>
              Mes itinéraires
            </button>
          </li>

          <li>
            <button onClick={() => onNavigate("creation")}>
              Créer un itinéraire
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;