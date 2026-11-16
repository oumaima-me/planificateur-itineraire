import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    // Simulation de vérification (À remplacer plus tard par l'appel API Laravel)
    if (!email || !password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    // Utilisateur fictif simulé pour le test
    const utilisateurConnecte = {
      id: 1,
      nom: email.split("@")[0], // Prend la partie avant le @ comme nom
      email: email,
      role: email.includes("admin") ? "admin" : "user", // Si l'email contient "admin", il est admin
    };

    onLogin(utilisateurConnecte);
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
            <Button type="submit">Se connecter</Button>
            <Button type="button" variant="secondary" onClick={onSwitchToRegister}>
              Créer un compte (Inscription)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Login;