import { useState } from "react";
import api from "../api/axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    if (!email || !password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      onLogin(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        "Identifiants incorrects ou serveur inaccessible.";
      setErreur(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Connexion</h1>
      <p>Connectez-vous pour accéder à vos itinéraires.</p>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
            <Button type="button" variant="secondary" onClick={onSwitchToRegister} disabled={loading}>
              Créer un compte (Inscription)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;