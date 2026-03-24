import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bankApi } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [mode, setMode] = useState("login"); // "login" | "register"

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    if (!u || !password) {
      setError("Remplis username + mdp.");
      return;
    }

    try {
      if (mode === "register") {
        await bankApi.post("/auth/register", { username: u, password });
        setMode("login");
        setError("Compte créé. Tu peux maintenant te connecter.");
        return;
      }

      const res = await bankApi.post("/auth/login", { username: u, password });
      localStorage.setItem("bank_username", u);
      localStorage.setItem("bank_userId", String(res.data.userId));
      navigate("/client");
    } catch (err) {
      const msg = err?.response?.data || err?.message || "Identifiants invalides.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="container">
      <h1>Bank App</h1>
      <p>Crée ton compte puis connecte-toi.</p>
      <form onSubmit={onSubmit} className="card">
        <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">{mode === "register" ? "Créer un compte" : "Se connecter"}</button>
        {error ? <p className="error">{error}</p> : null}
      </form>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
        {mode === "login" ? (
          <button type="button" className="btn-secondary" onClick={() => setMode("register")}>
            Créer un compte
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={() => setMode("login")}>
            J'ai déjà un compte
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
