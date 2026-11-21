import { useState } from "react";
import api from "../api/axios";

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    let authData = null;

    try {
      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      authData = response.data;
    } catch (error) {
      console.error("Erreur login :", error);
      setErreur(
        error.response?.data?.message ||
          "Identifiants incorrects ou serveur inaccessible."
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    if (authData && onLoginSuccess) {
      onLoginSuccess(authData);
    }
  }

  return (
    <div className="login-container">
      <h1>Connexion</h1>
      <p>Connectez-vous pour accéder à vos itinéraires</p>

      <form onSubmit={handleSubmit} className="card">
        {erreur && <p className="error-message">{erreur}</p>}

        <div className="input-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <div className="card-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onSwitchToRegister}
            style={{ width: "100%" }}
          >
            Créer un compte (Inscription)
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;