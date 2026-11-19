import { useState } from "react";
import api from "../api/axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function Register({ onRegister, onSwitchToLogin }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    if (!nom || !email || !password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register", {
        name: nom,
        email,
        password,
        password_confirmation: password,
      });

      // response.data contient { user, token }
      onRegister(response.data);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat()[0]
        : null;

      setErreur(
        firstValidationError ||
          error.response?.data?.message ||
          "Impossible de créer le compte. Vérifiez vos informations."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container" style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Inscription</h1>
      <p>Créez un compte pour commencer à planifier vos voyages.</p>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nom complet"
            type="text"
            placeholder="Ex : Mohamed Alami"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />

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
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
            <Button type="button" variant="secondary" onClick={onSwitchToLogin} disabled={loading}>
              Déjà un compte ? Se connecter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Register;