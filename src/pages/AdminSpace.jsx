function AdminSpace({ utilisateurs, onSupprimerUtilisateur }) {
  return (
    <div className="admin-space">
      <h1>Espace Administrateur</h1>
      <p>Gestion des utilisateurs du système (Rôle Admin)</p>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
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
              <td>{u.role}</td>
              <td>
                {u.role !== "admin" && (
                  <button onClick={() => onSupprimerUtilisateur(u.id)} style={{ color: "red" }}>
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminSpace;