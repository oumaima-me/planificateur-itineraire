import { useState } from "react";
import Card from "../components/Card";
import { Users, Compass, Trash2 } from "lucide-react";

function AdminSpace({ utilisateurs = [], itineraires = [], onSupprimerUtilisateur }) {
  const [ongletActif, setOngletActif] = useState("utilisateurs");

  const totalUtilisateurs = utilisateurs.length;
  const totalItineraires = itineraires.length;
  const nombreAdmins = utilisateurs.filter((u) => u.role === "admin").length;
  const nombreUsers = totalUtilisateurs - nombreAdmins;

  return (
    <div className="admin-space">
      <h1>Espace Administrateur</h1>
      <p>Supervision globale, gestion des utilisateurs et modération des itinéraires de la plateforme.</p>

      <div className="dashboard-stats admin-stats-grid">
        <Card>
          <div className="admin-stat-title">
            <Users size={20} /> Utilisateurs totaux
          </div>
          <p className="admin-stat-number">{totalUtilisateurs}</p>
          <small className="admin-stat-small">{nombreAdmins} admin(s), {nombreUsers} voyageur(s)</small>
        </Card>

        <Card>
          <div className="admin-stat-title green">
            <Compass size={20} /> Itinéraires de la plateforme
          </div>
          <p className="admin-stat-number">{totalItineraires}</p>
          <small className="admin-stat-small">Créés par l'ensemble des membres</small>
        </Card>
      </div>

      <div className="admin-tabs">
        <button
          onClick={() => setOngletActif("utilisateurs")}
          className={`admin-tab-btn ${ongletActif === "utilisateurs" ? "active" : ""}`}
        >
          Gérer les utilisateurs ({totalUtilisateurs})
        </button>
      </div>

      {ongletActif === "utilisateurs" && (
        <div className="admin-section">
          <h2>Liste des utilisateurs</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nom}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role === "admin" ? "admin" : "user"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => onSupprimerUtilisateur(u.id)}
                        className="btn-delete-item"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default AdminSpace;